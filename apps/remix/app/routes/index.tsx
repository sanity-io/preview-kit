import { Link } from '@remix-run/react'

import Container from 'components/Container'

const links = [
  ['Next 12 - cookie', 'https://preview-kit.sanity.build/next12-cookie'],
  ['Next 12 - token', 'https://preview-kit.sanity.build/next12-token'],
  ['Next 12 - hydration', 'https://preview-kit.sanity.build/next12-hydration'],
  ['Next 13 - cookie', 'https://preview-kit.sanity.build/next13-cookie'],
  ['Next 13 - token', 'https://preview-kit.sanity.build/next13-token'],
  ['Next 13 - hydration', 'https://preview-kit.sanity.build/next13-hydration'],
  ['Remix - cookie', '/remix-cookie'],
  ['Remix - token', '/remix-token'],
  ['Remix - hydration', '/remix-hydration'],
]

export default function Index() {
  return (
    <Container back={false}>
      <a
        className="title"
        href="https://remix.run/"
        target="_blank"
        rel="noreferrer noopener"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="200"
          viewBox="0 0 1200 627"
          fill="none"
        >
          <g filter="url(#filter0_dd_351_34)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M378.744 361.947C380.387 383.214 380.387 393.183 380.387 404.065H331.558C331.558 401.694 331.6 399.526 331.642 397.327C331.774 390.492 331.912 383.365 330.813 368.971C329.361 347.899 320.356 343.216 303.798 343.216H289.128H227V304.876H306.122C327.037 304.876 337.494 298.464 337.494 281.489C337.494 266.563 327.037 257.517 306.122 257.517H227V220H314.836C362.186 220 385.716 242.536 385.716 278.535C385.716 305.461 369.158 323.021 346.79 325.948C365.672 329.753 376.71 340.582 378.744 361.947Z"
              fill="#E8F2FF"
            />
            <path
              d="M227 404.065V375.483H278.63C287.254 375.483 289.126 381.929 289.126 385.772V404.065H227Z"
              fill="#E8F2FF"
            />
          </g>
          <g filter="url(#filter1_dd_351_34)">
            <path
              d="M967.943 275.524H919.548L897.523 306.474L876.079 275.524H824.206L870.862 339.467L820.148 405.745H868.544L894.336 370.416L920.127 405.745H972L920.996 337.423L967.943 275.524Z"
              fill="#FFF0F1"
            />
          </g>
          <g filter="url(#filter2_dd_351_34)">
            <path
              d="M663.111 297.105C657.605 281.922 645.723 271.411 622.83 271.411C603.414 271.411 589.504 280.171 582.549 294.477V274.915H535.602V405.135H582.549V341.193C582.549 321.631 588.055 308.784 603.414 308.784C617.614 308.784 621.091 318.127 621.091 335.938V405.135H668.038V341.193C668.038 321.631 673.254 308.784 688.903 308.784C703.102 308.784 706.29 318.127 706.29 335.938V405.135H753.237V323.383C753.237 296.229 742.804 271.411 707.16 271.411C685.425 271.411 670.066 282.506 663.111 297.105Z"
              fill="#FFFAEA"
            />
          </g>
          <g filter="url(#filter3_dd_351_34)">
            <path
              d="M486.716 354.599C482.369 364.818 474.255 369.197 461.504 369.197C447.304 369.197 435.712 361.606 434.553 345.547H525.258V332.409C525.258 297.08 502.365 267.298 459.185 267.298C418.904 267.298 388.766 296.788 388.766 337.956C388.766 379.416 418.325 404.526 459.765 404.526C493.961 404.526 517.724 387.884 524.389 358.102L486.716 354.599ZM435.133 322.773C436.871 310.51 443.537 301.167 458.606 301.167C472.516 301.167 480.05 311.094 480.63 322.773H435.133Z"
              fill="#F1FFF0"
            />
          </g>
          <g filter="url(#filter4_dd_351_34)">
            <path
              d="M768.592 275.78V406H815.538V275.78H768.592ZM768.302 263.517H815.828V222.056H768.302V263.517Z"
              fill="#FFF7FF"
            />
          </g>
          <defs>
            <filter
              id="filter0_dd_351_34"
              x="185"
              y="178"
              width="242.715"
              height="268.065"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="21" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_351_34"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.223529 0 0 0 0 0.572549 0 0 0 0 1 0 0 0 0.9 0"
              />
              <feBlend
                mode="normal"
                in2="effect1_dropShadow_351_34"
                result="effect2_dropShadow_351_34"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect2_dropShadow_351_34"
                result="shape"
              />
            </filter>
            <filter
              id="filter1_dd_351_34"
              x="788.148"
              y="243.524"
              width="215.852"
              height="194.22"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_351_34"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="16" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.960784 0 0 0 0 0.2 0 0 0 0 0.258824 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="effect1_dropShadow_351_34"
                result="effect2_dropShadow_351_34"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect2_dropShadow_351_34"
                result="shape"
              />
            </filter>
            <filter
              id="filter2_dd_351_34"
              x="507.602"
              y="243.411"
              width="273.634"
              height="189.724"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.996078 0 0 0 0 0.8 0 0 0 0 0.105882 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_351_34"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.996078 0 0 0 0 0.8 0 0 0 0 0.105882 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="effect1_dropShadow_351_34"
                result="effect2_dropShadow_351_34"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect2_dropShadow_351_34"
                result="shape"
              />
            </filter>
            <filter
              id="filter3_dd_351_34"
              x="360.766"
              y="239.298"
              width="192.493"
              height="193.228"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.419608 0 0 0 0 0.85098 0 0 0 0 0.407843 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_351_34"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.419608 0 0 0 0 0.85098 0 0 0 0 0.407843 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="effect1_dropShadow_351_34"
                result="effect2_dropShadow_351_34"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect2_dropShadow_351_34"
                result="shape"
              />
            </filter>
            <filter
              id="filter4_dd_351_34"
              x="740.302"
              y="194.056"
              width="103.526"
              height="239.944"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.847059 0 0 0 0 0.231373 0 0 0 0 0.823529 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_351_34"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="14" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.847059 0 0 0 0 0.231373 0 0 0 0 0.823529 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="effect1_dropShadow_351_34"
                result="effect2_dropShadow_351_34"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect2_dropShadow_351_34"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </a>
      <div className="columns is-multiline is-mobile">
        {links.map(([label, href]) => (
          <div className="column" key={href}>
            {href.startsWith('http') ? (
              <a href={href} className="button is-block is-link is-light">
                {label}
              </a>
            ) : (
              <Link
                prefetch="intent"
                to={href}
                className="button is-block is-link is-light"
              >
                {label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </Container>
  )
}
