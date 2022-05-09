import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/resourcesManagement',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/resourcesManagement/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/resourcesManagement',
    method: 'put',
    data
  })
}

export function editEnabled(data) {
  return request({
    url: 'api/resourcesManagement/editEnabled',
    method: 'put',
    data
  })
}

export default { add, edit, del, editEnabled }
