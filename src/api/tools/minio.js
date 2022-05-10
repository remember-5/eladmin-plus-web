import request from '@/utils/request'

export function get() {
  return request({
    url: 'api/minioConfig',
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: 'api/minioConfig',
    data,
    method: 'put'
  })
}

export default { get, update }
