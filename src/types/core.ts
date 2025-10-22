export interface ApiType {
  /** 搜索
   * @param search 搜索关键词
   * @param page 页码
   * @param pageSize 每页数量
   */
  search (search: string, page?: number, pageSize?: number): Promise<any>
}
