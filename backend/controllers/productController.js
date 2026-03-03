const Product = require("../models/Product");
const User = require("../models/User");

const normalizeLocation = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const match = raw.match(/^(?:box\s*)?([a-z0-9-]+)$/i);
  if (!match) return "";
  return `Box ${match[1].toUpperCase()}`;
};

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, description, image, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required.",
      });
    }

    const seller = await User.findById(req.user.id).select("role assignedBox");
    if (!seller) {
      return res.status(404).json({ message: "Seller account not found." });
    }
    if (seller.role !== "boutique" && seller.role !== "admin") {
      return res.status(403).json({ message: "Only boutique/admin can publish products." });
    }

    // Sellers are created by admins now; no pending approval workflow.
    if (seller.role === "boutique") {
      if (!seller.assignedBox) {
        return res.status(403).json({
          message: "No box assigned yet. Ask admin to assign your box before publishing.",
        });
      }
    }

    const normalizedLocation = normalizeLocation(seller.assignedBox);

    const product = new Product({
      name,
      price,
      stock: stock || 0,
      description,
      location: normalizedLocation,
      image,
      category,
      shop: req.user.id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL with filters
exports.getProducts = async (req, res) => {
  try {
    const { category, shop, search, minPrice, maxPrice, page, limit } = req.query;
    let filter = { isActive: true };
    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 0));
    const skip = parsedLimit ? (parsedPage - 1) * parsedLimit : 0;

    if (category) filter.category = category;
    if (shop) filter.shop = shop;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      const parsedMin = Number(minPrice);
      const parsedMax = Number(maxPrice);
      if (Number.isFinite(parsedMin)) filter.price.$gte = parsedMin;
      if (Number.isFinite(parsedMax)) filter.price.$lte = parsedMax;
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    let query = Product.find(filter)
      .select("name price stock description location image category rating shop isActive createdAt")
      .populate("shop", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (parsedLimit) {
      query = query.skip(skip).limit(parsedLimit);
    }

    const products = await query;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("shop", "name email")
      .populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the owner or admin
    if (product.shop.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatePayload = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updatePayload, "location")) {
      const normalizedLocation = normalizeLocation(updatePayload.location);
      if (!normalizedLocation) {
        return res.status(400).json({
          message: "Invalid location format. Use format like 'Box 5'.",
        });
      }
      updatePayload.location = normalizedLocation;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true },
    ).populate("shop", "name email");

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the owner or admin
    if (product.shop.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD REVIEW
exports.addReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews.push({
      user: req.user.id,
      comment,
      rating,
    });

    // Calculate average rating
    const avgRating =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length;
    product.rating = avgRating;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET PRODUCTS BY SHOP
exports.getProductsByShop = async (req, res) => {
  try {
    const products = await Product.find({
      shop: req.params.shopId,
      isActive: true,
    })
      .select("name price stock description location image category rating shop isActive createdAt")
      .populate("shop", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PRODUCTS VISIBLE TO ADMIN (only boutiques that opted-in)
exports.getAdminVisibleProducts = async (req, res) => {
  try {
    const sellers = await User.find({
      role: "boutique",
      adminCanViewCommerce: true,
    }).select("_id");
    const sellerIds = sellers.map((s) => s._id);

    const products = await Product.find({
      shop: { $in: sellerIds },
      isActive: true,
    })
      .select("name price stock description location image category rating shop isActive createdAt")
      .populate("shop", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
