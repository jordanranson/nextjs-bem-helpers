function concatBemNamespaces (root, classNames, styles) {
  if (!classNames) return ''

  const result = classNames
    .map((className) => {
      if (!className) return
      return styles[`${root}__${className}`] || className
    })
    .filter((c) => c !== undefined)
    .join(' ')
    .trim()

  return result
}

function concatBemState (root, className, states, styles) {
  if (!states) return ''

  return states
    .map((state) => {
      if (!state) return
      const key = className ? `${root}__${className}${state}` : `${root}${state}`
      return styles[key] || key
    })
    .filter((s) => s !== undefined)
    .join(' ')
    .trim()
}

function rerouteRootArguments (args) {
  if (!args.length) return

  let [before, after, state] = args

  if (!after && !state) {
    state = before
    before = null
  }

  if (typeof state === 'string') state = state.split(' ')

  return [before, after, state]
}

function rerouteClassArguments ([before, after, root, state]) {
  if (!root) {
    root = before
    before = null

    if (after) {
      state = after
      after = null
    }
  }

  if (typeof state === 'string') state = state.split(' ')

  return [before, after, root, state]
}

/**
 * @function rootClassName
 * 
 * Generate namespaced component and component theme classes for the root element in a component.
 * If no namespaced version of a class is found, the raw class name will be used.
 * Undefined values are ommited.
 * 
 * @param {(array|string)} [states] - A space delimited string, or array, of BEM states
 * 
 * @also 
 * 
 * @param {array|null} before - Classes to add before the root class
 * @param {array|null} after - Classes to add after the root class
 * @param {(array|string)} [states] - A space delimited string, or array, of BEM states
 * 
 * @return {string} Component class names
 *
 * @example
 * <div className={rootClassName('--active')} />
 * <div className={rootClassName([isActive && '--active'])} />
 * <div className={rootClassName(null, [props.className], '--active')} />
 */

/**
 * @function className
 * 
 * Generate namespaced component classes.
 * If no namespaced version of a class is found, the raw class name will be used.
 * Undefined values are ommited.
 * 
 * @param {array} main - Main element class name
 * @param {(array|string)} [states] - A space delimited string, or array, of BEM states
 * 
 * @also 
 * 
 * @param {array|null} before - Classes to add before the root class
 * @param {array|null} after - Classes to add after the root class
 * @param {string} main - Main element class name
 * @param {(array|string)} [states] - A space delimited string, or array, of BEM states
 * 
 * @return {string} Component class names
 *
 * @example
 * <div className={className('MyComponent', '--active')} />
 * <div className={className('MyComponent', [isActive && '--active'])} />
 * <div className={className(null, [props.className], 'MyComponent')} />
 */

export function useComponentClasses (root, styles = {}) {
  return [
    // rootClassName
    function () {
      const result = rerouteRootArguments(Array.from(arguments));
      if (!result) return [
        styles[root] || root,
        `${root}`
      ]
        .filter((c) => c !== '')
        .join(' ')

      const [before, after, state] = result
      return [...new Set([
        concatBemNamespaces(root, before, styles),
        styles[root] || root,
        `${root}`,
        concatBemNamespaces(root, after, styles),
        concatBemState(root, null, state, styles)
      ])]
        .filter((c) => c !== '')
        .join(' ')
    },

    // className
    function () {
      const [before, after, main, state] = rerouteClassArguments(Array.from(arguments));
      return [...new Set([
        concatBemNamespaces(root, before, styles),
        styles[`${root}__${main}`] || main,
        `${root}__${main}`,
        concatBemNamespaces(root, after, styles),
        concatBemState(root, main, state, styles)
      ])]
        .filter((c) => c !== '')
        .join(' ')
    }
  ]
}

/**
 * Generate an array of BEM states from component props keys.
 * Keys that are undefined will not be added to the array.
 * Keys that are true will be added as `--<key>`.
 * Keys that equal a truthy value will be added as `--<key>-<value>`.
 * 
 * @param {object} props - Component props
 * @param {array} keys - Prop keys that should be used to generate states
 * 
 * @return {string[]} Enabled states
 *
 * @example
 * export default function (props) {
 *   const classStates = statesFromProps(props, ['selected'])
 * 
 *   return (
 *     <div className={rootClassName(null, null, classStates)} />
 *   )
 * })
 */

export function statesFromProps (props, states) {
  return states
    .map((s) => {
      if (!(props[s] === undefined || props[s] === null || props[s] === false)) {
        if (props[s] === true) return `--${s}`
        else return `--${s}-${props[s]}`
      }
      return
    })
    .filter((s) => s !== undefined)
}
