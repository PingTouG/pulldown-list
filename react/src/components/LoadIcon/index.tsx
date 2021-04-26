import React from 'react'

export interface LoadIconProps {
  color:string,
  className:string
}

const LoadIcon = (props:LoadIconProps) => {
  return   <svg
  xmlns="http://www.w3.org/2000/svg"
  xmlnsXlink="http://www.w3.org/1999/xlink"
  width="16px"
  height="20px"
  viewBox="0 0 24 30"
  style={({enableBackground: 'new 0 0 50 50'} as any)}
  xmlSpace="preserve"
>
  <rect x="0" y="9.22656" width="4" height="12.5469" fill={props.color}>
    <animate
      attributeName="height"
      attributeType="XML"
      values="5;21;5"
      begin="0s"
      dur="0.6s"
      repeatCount="indefinite"
    ></animate>
    <animate
      attributeName="y"
      attributeType="XML"
      values="13; 5; 13"
      begin="0s"
      dur="0.6s"
      repeatCount="indefinite"
    ></animate>
  </rect>
  <rect x="10" y="5.22656" width="4" height="20.5469" fill={props.color}>
    <animate
      attributeName="height"
      attributeType="XML"
      values="5;21;5"
      begin="0.15s"
      dur="0.6s"
      repeatCount="indefinite"
    ></animate>
    <animate
      attributeName="y"
      attributeType="XML"
      values="13; 5; 13"
      begin="0.15s"
      dur="0.6s"
      repeatCount="indefinite"
    ></animate>
  </rect>
  <rect x="20" y="8.77344" width="4" height="13.4531" fill={props.color}>
    <animate
      attributeName="height"
      attributeType="XML"
      values="5;21;5"
      begin="0.3s"
      dur="0.6s"
      repeatCount="indefinite"
    ></animate>
    <animate
      attributeName="y"
      attributeType="XML"
      values="13; 5; 13"
      begin="0.3s"
      dur="0.6s"
      repeatCount="indefinite"
    ></animate>
  </rect>
</svg>
}

LoadIcon.defaultProps = {
  color: '#2f54eb'
}

export default LoadIcon