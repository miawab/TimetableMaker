import React, { useState } from 'react'
import { motion, MotionConfigContext, LayoutGroup } from 'framer-motion'

const transition1 = { bounce: 0, delay: 0, duration: 0.4, type: "spring" }
const transition2 = { delay: 0, duration: 0.4, ease: [0.44, 0, 0.56, 1], type: "tween" }
const titleTransition = { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94], type: "tween" }
const transformTemplate1 = (_, t) => `translate(-50%, -50%) ${t}`

const Transition = ({ value, children }) => {
  const config = React.useContext(MotionConfigContext)
  const transition = value ?? config.transition
  const contextValue = React.useMemo(() => ({ ...config, transition }), [JSON.stringify(transition)])
  return <MotionConfigContext.Provider value={contextValue}>{children}</MotionConfigContext.Provider>
}

const Variants = motion.create(React.Fragment)

const CubeSlice = ({ isHover, cubeSliceVariants }) => (
  <Transition value={transition2}>
    <motion.div
      style={{ alignContent:"center", alignItems:"center", display:"flex", flex:"none", flexDirection:"row", flexWrap:"nowrap", gap:"10px", height:"min-content", justifyContent:"center", overflow:"visible", padding:"0px", position:"relative", transformStyle:"preserve-3d", width:"min-content" }}
    >
      {[
        { zIndex:120, position:"relative", width:"240px", height:"34px" },
        { position:"absolute", right:"0px", top:"0px", bottom:"0px", width:"240px", zIndex:1, rotateY:180 },
        { position:"absolute", left:"120px", top:"0px", bottom:"0px", width:"240px", zIndex:1, rotateY:90 },
        { position:"absolute", right:"120px", top:"0px", bottom:"0px", width:"240px", zIndex:1, rotateY:-90 },
        { position:"absolute", left:"0px", right:"0px", top:"-120px", height:"240px", zIndex:1, rotateX:90 },
        { position:"absolute", left:"0px", right:"0px", top:"-86px", height:"240px", zIndex:1, rotateX:90 },
      ].map((s, i) => (
        <motion.div
          key={i}
          style={{ ...s, alignContent:"center", alignItems:"center", display:"flex", flexDirection:"column", flexWrap:"nowrap", gap:"10px", justifyContent:"center", overflow:"hidden", padding:"0px", flex:"none", border:"4px solid var(--tw-color, #312E81)", backgroundColor:"#000" }}
          variants={cubeSliceVariants}
          animate={isHover ? 'hover' : 'default'}
        />
      ))}
    </motion.div>
  </Transition>
)

// ─── Compact cube logo for use in nav bars ───────────────────────────────────
export function LogoCube({ size = 32 }) {
  const [isHover, setIsHover] = useState(false)
  const cubeSliceVariants = { hover: { '--tw-color': 'rgb(255, 255, 255)', borderColor: 'rgb(255, 255, 255)' } }
  const sliceCubeVariants = { hover: { rotateX: -28, rotateY: -43, scale: 1.1 } }
  const scale = size / 88

  return (
    <motion.div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', borderRadius: Math.round(size * 0.25), border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#000', flexShrink: 0, cursor: 'pointer' }}
    >
      <motion.div style={{ flex: 'none', height: 348 * scale, overflow: 'visible', position: 'relative', width: 348 * scale, zIndex: 2 }}>
        <motion.div
          style={{ alignItems: 'center', display: 'flex', flex: 'none', flexDirection: 'column', flexWrap: 'nowrap', gap: 28 * scale, height: 'min-content', justifyContent: 'center', left: '50%', overflow: 'visible', padding: 0, position: 'absolute', top: '50%', transformStyle: 'preserve-3d', width: 'min-content', zIndex: 3, rotate: 49, rotateX: 23, rotateY: 33, scale: 0.7, transformPerspective: 1200 }}
          transformTemplate={(_, t) => `translate(-50%, -50%) ${t}`}
          variants={sliceCubeVariants}
          animate={isHover ? 'hover' : 'default'}
        >
          {[0, 1, 2].map((k) => (
            <Transition key={k} value={transition2}>
              <motion.div style={{ alignItems: 'center', display: 'flex', flex: 'none', flexDirection: 'row', flexWrap: 'nowrap', gap: 10 * scale, height: 'min-content', justifyContent: 'center', overflow: 'visible', padding: 0, position: 'relative', transformStyle: 'preserve-3d', width: 'min-content' }}>
                {[
                  { zIndex: 120, position: 'relative', width: 240 * scale, height: 34 * scale },
                  { position: 'absolute', right: 0, top: 0, bottom: 0, width: 240 * scale, zIndex: 1, rotateY: 180 },
                  { position: 'absolute', left: 120 * scale, top: 0, bottom: 0, width: 240 * scale, zIndex: 1, rotateY: 90 },
                  { position: 'absolute', right: 120 * scale, top: 0, bottom: 0, width: 240 * scale, zIndex: 1, rotateY: -90 },
                  { position: 'absolute', left: 0, right: 0, top: -120 * scale, height: 240 * scale, zIndex: 1, rotateX: 90 },
                  { position: 'absolute', left: 0, right: 0, top: -86 * scale, height: 240 * scale, zIndex: 1, rotateX: 90 },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    style={{ ...s, alignItems: 'center', display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', gap: 10, justifyContent: 'center', overflow: 'hidden', padding: 0, flex: 'none', border: `${Math.max(1, 4 * scale)}px solid var(--tw-color, #312E81)`, backgroundColor: '#000' }}
                    variants={cubeSliceVariants}
                    animate={isHover ? 'hover' : 'default'}
                  />
                ))}
              </motion.div>
            </Transition>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function IconHover3D({ heading = "Feature", text = "Description text goes here.", icon }) {
  const [isHover, setIsHover] = useState(false)
  const defaultLayoutId = React.useId()

  const cubeSliceVariants = { hover: { '--tw-color': 'rgb(139, 47, 250)', borderColor: 'rgb(139, 47, 250)' } }
  const sliceCubeVariants = { hover: { rotateX: -28, rotateY: -43, scale: 1.1 } }
  const cornerScaleVariants = { hover: { scale: 2.2 } }

  return (
    <LayoutGroup id={defaultLayoutId}>
      <Variants animate={[isHover ? 'hover' : 'default']} initial={false}>
        <Transition value={transition1}>
          <motion.div
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{ backgroundColor:"#000", alignContent:"center", alignItems:"center", display:"flex", flexDirection:"row", flexWrap:"nowrap", gap:"32px", height:"min-content", justifyContent:"center", overflow:"visible", padding:"20px 24px", position:"relative", width:"min-content", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Icon cube */}
            <motion.div style={{ alignContent:"center", alignItems:"center", display:"flex", flex:"none", flexDirection:"row", flexWrap:"nowrap", gap:"10px", height:"88px", justifyContent:"center", overflow:"visible", padding:"0px", position:"relative", width:"88px", zIndex:1, border:"1px solid rgba(255,255,255,0.15)", borderRadius:"8px" }}>
              <motion.div style={{ flex:"none", height:"348px", overflow:"visible", position:"relative", width:"348px", zIndex:2, scale:0.26 }}>
                {/* Animated cube */}
                <motion.div
                  style={{ alignContent:"center", alignItems:"center", display:"flex", flex:"none", flexDirection:"column", flexWrap:"nowrap", gap:"28px", height:"min-content", justifyContent:"center", left:"50%", overflow:"visible", padding:"0px", position:"absolute", top:"50%", transformStyle:"preserve-3d", width:"min-content", zIndex:3, rotate:49, rotateX:23, rotateY:33, scale:0.7, transformPerspective:1200 }}
                  transformTemplate={transformTemplate1}
                  variants={sliceCubeVariants}
                  animate={isHover ? 'hover' : 'default'}
                >
                  <CubeSlice isHover={isHover} cubeSliceVariants={cubeSliceVariants} />
                  <CubeSlice isHover={isHover} cubeSliceVariants={cubeSliceVariants} />
                  <CubeSlice isHover={isHover} cubeSliceVariants={cubeSliceVariants} />
                </motion.div>
                {/* Corners */}
                {[
                  { top: isHover ? "-6px" : "14px", left: isHover ? "-6px" : "14px", borderLeft:"4px solid #fff", borderTop:"4px solid #fff" },
                  { top: isHover ? "330px" : "310px", left: isHover ? "-6px" : "14px", borderLeft:"4px solid #fff", borderBottom:"4px solid #fff" },
                  { bottom: isHover ? "-6px" : "14px", right: isHover ? "-6px" : "14px", borderRight:"4px solid #fff", borderBottom:"4px solid #fff" },
                  { top: isHover ? "-6px" : "14px", right: isHover ? "-6px" : "14px", borderRight:"4px solid #fff", borderTop:"4px solid #fff" },
                ].map((s, i) => (
                  <motion.div key={i} style={{ ...s, flex:"none", height:"24px", overflow:"hidden", position:"absolute", width:"24px", zIndex:2, scale:1 }} variants={cornerScaleVariants} animate={isHover ? 'hover' : 'default'} />
                ))}
              </motion.div>
            </motion.div>

            {/* Text content */}
            <motion.div style={{ alignContent:"flex-start", alignItems:"flex-start", display:"flex", flex:"none", flexDirection:"column", flexWrap:"nowrap", gap:"8px", height:"min-content", justifyContent:"center", maxWidth:"280px", overflow:"hidden", padding:"0px", position:"relative", width:"min-content" }}>
              {/* Heading with fill animation */}
              <div style={{ position:"relative", height:"28px", display:"flex", alignItems:"center", overflow:"hidden" }}>
                <span style={{ fontFamily:'"Inter",sans-serif', fontWeight:"600", fontSize:"16px", color:"#fff", position:"relative", zIndex:1, whiteSpace:"nowrap", padding:"0 2px" }}>
                  {heading}
                </span>
                <motion.span style={{ position:"absolute", top:0, left:0, fontFamily:'"Inter",sans-serif', fontWeight:"600", fontSize:"16px", color:"#000", padding:"0 2px", zIndex:2, clipPath:`inset(0 ${isHover ? '0%' : '100%'} 0 0)` }} animate={{ clipPath:`inset(0 ${isHover ? '0%' : '100%'} 0 0)` }} transition={titleTransition}>
                  {heading}
                </motion.span>
                <motion.div style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", backgroundColor:"#fff", transformOrigin:"left center", scaleX:0, zIndex:1 }} animate={{ scaleX: isHover ? 1 : 0 }} transition={titleTransition} />
              </div>
              {/* Description */}
              <p style={{ fontFamily:'"Inter",sans-serif', fontWeight:"400", fontSize:"13px", lineHeight:"1.5em", color:"rgba(255,255,255,0.6)", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word", maxWidth:"280px" }}>
                {text}
              </p>
            </motion.div>
          </motion.div>
        </Transition>
      </Variants>
    </LayoutGroup>
  )
}
