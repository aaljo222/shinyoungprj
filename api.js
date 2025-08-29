import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});
//items
// export const fetchItems = () => api.get("/api/items").then((r) => r.data);
export const createItem = (form) =>
  api.post("/api/items", form).then((r) => r.data);
export const updateItem = (id, payload) =>
  api.put(`/api/items/${id}`, payload).then((r) => r.data);
export const deleteItem = () =>
  api.delete(`/api/items/${id}`).then((r) => r.data);
// with REST API , => CRUD에 맞도록 방식이 추가 , 생성(POST) , 수정(put, patch) ,삭제(delete) ,조회(get)
// without REST API => post ,get

//images
export const searchImages = (q) =>
  api.get("/api/images", { params: { q } }).then((r) => r.data);
