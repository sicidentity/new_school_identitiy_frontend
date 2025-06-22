interface LoaderProps {
  size?: string
  className?: string
}

export default function Loader({ size = "2.5em", className = "" }: LoaderProps) {

  const sizeValue = Number.parseFloat(size)
  const sizeUnit = size.replace(/[\d.]/g, "")
  const thickness = `0.5${sizeUnit}`
  const lat = `${(sizeValue - 0.5) / 2}${sizeUnit}`
  const offset = `${(sizeValue - 0.5) / 2 - 0.5}${sizeUnit}`

  const colors = [
    "hsla(190, 61%, 65%, 0.75)",
    "hsla(160, 50%, 48%, 0.75)",
    "hsla(190, 61%, 65%, 0.75)",
    "hsla(160, 50%, 48%, 0.75)",
  ]

  return (
    <>
      <style>{`
        .loader {
          position: relative;
          width: ${size};
          height: ${size};
          transform: rotate(165deg);
        }
        
        .loader:before,
        .loader:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          display: block;
          width: ${thickness};
          height: ${thickness};
          border-radius: calc(${thickness} / 2);
          transform: translate(-50%, -50%);
        }
        
        .loader:before {
          animation: loader-before 2s infinite;
        }
        
        .loader:after {
          animation: loader-after 2s infinite;
        }

        @keyframes loader-before {
          0% {
            width: ${thickness};
            box-shadow:
              ${lat} calc(-1 * ${offset}) ${colors[0]},
              calc(-1 * ${lat}) ${offset} ${colors[2]};
          }
          35% {
            width: ${size};
            box-shadow:
              0 calc(-1 * ${offset}) ${colors[0]},
              0 ${offset} ${colors[2]};
          }
          70% {
            width: ${thickness};
            box-shadow:
              calc(-1 * ${lat}) calc(-1 * ${offset}) ${colors[0]},
              ${lat} ${offset} ${colors[2]};
          }
          100% {
            box-shadow:
              ${lat} calc(-1 * ${offset}) ${colors[0]},
              calc(-1 * ${lat}) ${offset} ${colors[2]};
          }
        }

        @keyframes loader-after {
          0% {
            height: ${thickness};
            box-shadow:
              ${offset} ${lat} ${colors[1]},
              calc(-1 * ${offset}) calc(-1 * ${lat}) ${colors[3]};
          }
          35% {
            height: ${size};
            box-shadow:
              ${offset} 0 ${colors[1]},
              calc(-1 * ${offset}) 0 ${colors[3]};
          }
          70% {
            height: ${thickness};
            box-shadow:
              ${offset} calc(-1 * ${lat}) ${colors[1]},
              calc(-1 * ${offset}) ${lat} ${colors[3]};
          }
          100% {
            box-shadow:
              ${offset} ${lat} ${colors[1]},
              calc(-1 * ${offset}) calc(-1 * ${lat}) ${colors[3]};
          }
        }

        .loader-centered {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(165deg);
        }
      `}</style>
      <div className={`loader ${className}`} />
    </>
  )
}
