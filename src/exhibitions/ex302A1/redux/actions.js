export const SET_PAGE_ID = 'SET_PAGE_ID';

export function setPageId(pageid) {
  return { type: SET_PAGE_ID, data: pageid };
}