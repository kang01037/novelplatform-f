export function debounce(fn, delay = 300, options = {}) {
  const { leading = false } = options
  let timer = null
  let leadingCalled = false

  const debounced = function (...args) {
    const context = this
    if (timer) clearTimeout(timer)

    if (leading && !leadingCalled) {
      leadingCalled = true
      fn.apply(context, args)
    }

    timer = setTimeout(() => {
      leadingCalled = false
      if (!leading) {
        fn.apply(context, args)
      }
    }, delay)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
    leadingCalled = false
  }

  return debounced
}

export function throttle(fn, delay = 300, options = {}) {
  const { leading = true, trailing = true } = options
  let timer = null
  let lastArgs = null

  const invoke = (context, args) => {
    fn.apply(context, args)
    timer = setTimeout(() => {
      timer = null
      if (trailing && lastArgs) {
        const queuedArgs = lastArgs
        lastArgs = null
        invoke(context, queuedArgs)
      }
    }, delay)
  }

  const throttled = function (...args) {
    if (timer) {
      lastArgs = args
      return
    }
    if (leading) {
      invoke(this, args)
    } else {
      lastArgs = args
      timer = setTimeout(() => {
        timer = null
        if (lastArgs) {
          const queuedArgs = lastArgs
          lastArgs = null
          invoke(this, queuedArgs)
        }
      }, delay)
    }
  }

  throttled.cancel = () => {
    clearTimeout(timer)
    timer = null
    lastArgs = null
  }

  return throttled
}

export function isSuccess(response) {
  const data = response?.data || response
  return data?.code === 200 || data?.message === 'success'
}

export function getResponseData(response) {
  return response?.data?.data || response?.data
}

export function getErrorMessage(response, defaultMsg = '操作失败') {
  const data = response?.data || response
  return data?.message || defaultMsg
}

export function handleApiResponse(response, successCallback, errorCallback) {
  const data = response?.data || response
  if (data?.code === 200 || data?.message === 'success') {
    if (successCallback) successCallback(data.data)
    return true
  } else {
    if (errorCallback) errorCallback(data?.message || '操作失败')
    return false
  }
}
