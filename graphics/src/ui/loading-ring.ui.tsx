import React, { useMemo } from 'react'

interface Props {
  percentage: number // The percentage to display (0-100)
  radius: number | string // Radius of the ring (can now be a number or vw string)
  strokeWidth: number | string // Thickness of the ring (can now be a number or vw string)
  color?: string // Color of the progress ring
  bgColor?: string // Background color of the ring
}

const convertVwToPixels = (vwValue: string): number => {
  // Remove 'vw' and convert to number
  const numericValue = parseFloat(vwValue)
  // Calculate pixels based on viewport width
  return (numericValue / 100) * window.innerWidth
}

const LoadingRing = ({
  percentage,
  radius,
  strokeWidth,
  color = "tomato",
  bgColor = "transparent",
}: Props) => {
  // Convert radius and strokeWidth to pixels if they are vw strings
  const pixelRadius = useMemo(() => {
    return typeof radius === 'string' && radius.endsWith('vw') 
      ? convertVwToPixels(radius)
      : Number(radius)
  }, [radius])

  const pixelStrokeWidth = useMemo(() => {
    return typeof strokeWidth === 'string' && strokeWidth.endsWith('vw')
      ? convertVwToPixels(strokeWidth)
      : Number(strokeWidth)
  }, [strokeWidth])

  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100) // Clamp percentage between 0 and 100

  const normalizedRadius = pixelRadius - pixelStrokeWidth / 2 // Adjust radius for stroke width
  const circumference = 2 * Math.PI * normalizedRadius // Full circumference of the circle
  const strokeDashoffset =
    circumference - (normalizedPercentage / 100) * circumference // Calculate stroke offset based on percentage

  return (
    <svg
      width={pixelRadius * 2}
      height={pixelRadius * 2}
      viewBox={`0 0 ${pixelRadius * 2} ${pixelRadius * 2}`}
    >
      {/* Background Circle */}
      <circle
        cx={pixelRadius}
        cy={pixelRadius}
        r={normalizedRadius}
        stroke={bgColor}
        strokeWidth={pixelStrokeWidth}
        fill="none"
      />
      {/* Progress Circle */}
      {percentage > 0 && (
        <circle
          cx={pixelRadius}
          cy={pixelRadius}
          r={normalizedRadius}
          stroke={color}
          strokeWidth={pixelStrokeWidth}
          fill="none"
          strokeDasharray={circumference} // Total circumference
          strokeDashoffset={strokeDashoffset} // Visible part
        />
      )}
    </svg>
  )
}

export default LoadingRing