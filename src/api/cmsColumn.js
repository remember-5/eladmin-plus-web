import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/cmsColumn',
    method: 'post',
    data
  })
}

export function addFirstLevelColumn(data) {
  return request({
    url: 'api/cmsColumn/addFirstLevelColumn',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/cmsColumn/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/cmsColumn',
    method: 'put',
    data
  })
}

export function selectcms(ids) {
  return request({
    url: 'api/cmsColumn/query',
    method: 'get',
    params: ids
  })
}

export function getTree() {
  return request({
    url: 'api/cmsColumn/getTree',
    method: 'get'
  })
}

export default { add, edit, del, selectcms, getTree, addFirstLevelColumn }
