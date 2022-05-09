import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/messageNotification',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/messageNotification/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/messageNotification',
    method: 'put',
    data
  })
}

export function getMessage() {
  return request({
    url: 'api/messageNotification/getMessage',
    method: 'get',
  })
}

export default { add, edit, del, getMessage }
