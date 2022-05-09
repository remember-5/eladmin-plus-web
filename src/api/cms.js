import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/cms',
    method: 'post',
    data
  })
}
export function esquery(data) {
  return request({
    url: 'api/cms/esQuery',
    method: 'post',
    data
  })
}
export function del(ids) {
  return request({
    url: 'api/cms/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/cms',
    method: 'put',
    data
  })
}

export function audit(data) {
  return request({
    url: 'api/cms/audit',
    method: 'put',
    data
  })
}

export function publish(data) {
  return request({
    url: 'api/cms/publish',
    method: 'put',
    data
  })
}

export function pushTest(typeName, msgBriefly) {
  return request({
    url: 'api/pushGetui/pushTest?typeName=' + typeName + '&msgBriefly=' + msgBriefly,
    method: 'get'
  })
}

export function queryList() {
  return request({
    url: 'api/ybTbTask/queryList',
    method: 'get'
  })
}

export default { add, edit, del, audit, publish, esquery, pushTest, queryList }
