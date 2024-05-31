import axios from 'axios'
import { logger } from './logger'

axios.interceptors.request.use((request) => {
  const requestFields = {
    url: request.url,
    headers: request.headers,
    method: request.method,
  }

  logger.info(
    requestFields,
    `Outgoing request: ${request.method?.toUpperCase()} ${request.url}`
  )
  return request
})

axios.interceptors.response.use((response) => {
  const responseFields = {
    status: response.status,
    headers: response.headers,
    url: response.config.url,
  }
  logger.info(
    responseFields,
    `Outgoing response: ${response.config.method?.toUpperCase()} ${
      response.config.url
    } ${response.status}`
  )
  return response
})

export default axios
