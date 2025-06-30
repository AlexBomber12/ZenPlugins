import isFunction from 'lodash-es/isFunction'
import isObject from 'lodash-es/isObject'
import isString from 'lodash-es/isString'
import isNumber from 'lodash-es/isNumber'
import isDate from 'lodash-es/isDate'
import isBoolean from 'lodash-es/isBoolean'
import isTypedArray from 'lodash-es/isTypedArray'
import isArray from 'lodash-es/isArray'
import mapValues from 'lodash-es/mapValues'
import { parse, stringify } from 'querystring'

export function sanitize (value, mask) {
  if (!mask) {
    return value
  }
  if (isFunction(mask)) {
    return mask(value)
  }
  if (isObject(mask) && !isObject(value)) {
    return value
  }
  if (isString(value)) {
    return `<string[${value.length}]>`
  }
  if (isNumber(value)) {
    return '<number>'
  }
  if (isDate(value)) {
    return '<date>'
  }
  if (isBoolean(value)) {
    return '<bool>'
  }
  if (isTypedArray(value)) {
    const arrayTypeName = Object.prototype.toString.call(value).match(/^\[object (.*)]$/i)[1]
    return `<${arrayTypeName}[${value.length}]>`
  }
  if (isArray(value)) {
    return value.map((item) => sanitize(item, mask))
  }
  if (isObject(value)) {
    return mapValues(value, (val, key) => sanitize(val, mask === true ? true : mask[key]))
  }
  return '<value>'
}

export function sanitizeUrl (url, mask) {
  if (!isString(url) || !isObject(mask) || isFunction(mask)) {
    return sanitize(url, mask)
  }
  const queryIndex = url.indexOf('?')
  if (queryIndex < 0 || queryIndex >= url.length - 1) {
    return url
  }
  const urlWithoutQuery = url.substring(0, queryIndex)
  const query = parse(url.substring(queryIndex + 1))
  return urlWithoutQuery + '?' + stringify(sanitize(query, mask.query)).replace(/%3Cstring%5B(\d+)%5D%3E/g, '<string[$1]>')
}

export function sanitizeUrlContainingObject (object, mask) {
  if (!isObject(object) || !isObject(mask) || !('url' in object) || !('url' in mask)) {
    return sanitize(object, mask)
  }
  return sanitize(object, {
    ...mask,
    url: (url) => sanitizeUrl(url, mask.url)
  })
}
