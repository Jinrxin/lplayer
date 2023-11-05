<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    style="margin: auto; display: block"
    width="100px"
    height="100px"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
  >
    <defs>
      <filter
        id="ldio-rf74c0va6u-filter"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.4000000000000004"></feGaussianBlur>
        <feComponentTransfer result="cutoff">
          <feFuncA type="table" tableValues="0 0 0 0 0 0 1 1 1 1 1"></feFuncA>
        </feComponentTransfer>
      </filter>
    </defs>
    <g filter="url(#ldio-rf74c0va6u-filter)">
      <g transform="translate(50 50)">
        <g>
          <circle cx="17" cy="0" r="5" fill="#d5e4ff">
            <animate
              attributeName="r"
              keyTimes="0;0.5;1"
              values="3.5999999999999996;8.399999999999999;3.5999999999999996"
              dur="4s"
              repeatCount="indefinite"
              begin="-0.25s"
            ></animate>
          </circle>
          <animateTransform
            attributeName="transform"
            type="rotate"
            keyTimes="0;1"
            values="0;360"
            dur="4s"
            repeatCount="indefinite"
            begin="0s"
          ></animateTransform>
        </g>
      </g>
      <g transform="translate(50 50)">
        <g>
          <circle cx="17" cy="0" r="5" fill="#e7f864">
            <animate
              attributeName="r"
              keyTimes="0;0.5;1"
              values="3.5999999999999996;8.399999999999999;3.5999999999999996"
              dur="2s"
              repeatCount="indefinite"
              begin="-0.2s"
            ></animate>
          </circle>
          <animateTransform
            attributeName="transform"
            type="rotate"
            keyTimes="0;1"
            values="0;360"
            dur="2s"
            repeatCount="indefinite"
            begin="-0.05s"
          ></animateTransform>
        </g>
      </g>
      <g transform="translate(50 50)">
        <g>
          <circle cx="17" cy="0" r="5" fill="#dae8ff">
            <animate
              attributeName="r"
              keyTimes="0;0.5;1"
              values="3.5999999999999996;8.399999999999999;3.5999999999999996"
              dur="1.3333333333333333s"
              repeatCount="indefinite"
              begin="-0.15s"
            ></animate>
          </circle>
          <animateTransform
            attributeName="transform"
            type="rotate"
            keyTimes="0;1"
            values="0;360"
            dur="1.3333333333333333s"
            repeatCount="indefinite"
            begin="-0.1s"
          ></animateTransform>
        </g>
      </g>
      <g transform="translate(50 50)">
        <g>
          <circle cx="17" cy="0" r="5" fill="#80aaf3">
            <animate
              attributeName="r"
              keyTimes="0;0.5;1"
              values="3.5999999999999996;8.399999999999999;3.5999999999999996"
              dur="1s"
              repeatCount="indefinite"
              begin="-0.1s"
            ></animate>
          </circle>
          <animateTransform
            attributeName="transform"
            type="rotate"
            keyTimes="0;1"
            values="0;360"
            dur="1s"
            repeatCount="indefinite"
            begin="-0.15s"
          ></animateTransform>
        </g>
      </g>
      <g transform="translate(50 50)">
        <g>
          <circle cx="17" cy="0" r="5" fill="#fff3fe">
            <animate
              attributeName="r"
              keyTimes="0;0.5;1"
              values="3.5999999999999996;8.399999999999999;3.5999999999999996"
              dur="0.8s"
              repeatCount="indefinite"
              begin="-0.05s"
            ></animate>
          </circle>
          <animateTransform
            attributeName="transform"
            type="rotate"
            keyTimes="0;1"
            values="0;360"
            dur="0.8s"
            repeatCount="indefinite"
            begin="-0.2s"
          ></animateTransform>
        </g>
      </g>
    </g>
  </svg>

  <!-- <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      style="margin: auto; background: rgb(241, 242, 243); display: block"
      width="118px"
      height="118px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <g transform="translate(50 50) scale(0.8)">
        <g>
          <animateTransform
            attributeName="transform"
            type="scale"
            repeatCount="indefinite"
            calcMode="spline"
            dur="2s"
            values="0.8;0.5;0.8"
            keyTimes="0;0.5;1"
            keySplines="0.5 0 0.5 1;0.5 0 0.5 1"
          ></animateTransform>
          <rect
            x="-45"
            y="-45"
            width="90"
            height="90"
            fill="#ffd0d3"
            stroke="#eaf8ff"
            stroke-width="10"
            stroke-linejoin="round"
            rx="1"
            ry="1"
          >
            <animate
              attributeName="rx"
              repeatCount="indefinite"
              dur="2s"
              values="0;50;0"
              keyTimes="0;0.5;1"
            ></animate>
            <animate
              attributeName="ry"
              repeatCount="indefinite"
              dur="2s"
              values="0;50;0"
              keyTimes="0;0.5;1"
            ></animate>
            <animate
              attributeName="stroke-width"
              repeatCount="indefinite"
              dur="2s"
              values="10;16;10"
              keyTimes="0;0.5;1"
            ></animate>
            <animateTransform
              attributeName="transform"
              type="rotate"
              repeatCount="indefinite"
              dur="2s"
              values="0 0 0;270 0 0;540 0 0"
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.5 0 0.5 1;0.5 0 0.5 1"
            ></animateTransform>
          </rect>
        </g>
      </g>
    </svg> -->
</template>
