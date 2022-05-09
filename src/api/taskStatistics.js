import request from '@/utils/request'
export function getrecordday() {
  return request({
    url: '/api/smsRecord/getrecordday',
    method: 'get'
  })
}

export function getrecordweek() {
  return request({
    url: '/api/smsRecord/getrecordweek',
    method: 'get'
  })
}

export function getrecordmonth() {
  return request({
    url: '/api/smsRecord/getrecordmonth',
    method: 'get'
  })
}
export function getcustomTime(start, end) {
  return request({
    url: '/api/smsRecord/getcustomTime?start=' + start + '&end=' + end,
    method: 'get'
  })
}
export default { getrecordday }
