import { COLORS } from './constants'

/** Glossy moulded plastic for the shell. */
export const ShellMaterial = ({ color = COLORS.shell }: { color?: string }) => (
  <meshPhysicalMaterial color={color} roughness={0.32} metalness={0} clearcoat={0.6} clearcoatRoughness={0.25} />
)

/** Matte textured plastic for the skirt, bumper housings and wheels. */
export const SkirtMaterial = ({ color = COLORS.skirt }: { color?: string }) => (
  <meshStandardMaterial color={color} roughness={0.75} metalness={0} />
)
