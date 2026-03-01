export type EntityWithIds = {
  id?: string | null;
  _id?: string | null;
};

export function getEntityId(entity?: EntityWithIds | null): string {
  return entity?.id || entity?._id || '';
}
