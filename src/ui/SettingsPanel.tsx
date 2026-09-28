import { useAppStore, type Settings } from '../store/useAppStore'

function Toggle({ label, hint, field }: { label: string; hint: string; field: keyof Settings }) {
  const value = useAppStore((s) => s.settings[field]) as boolean
  const update = useAppStore((s) => s.updateSettings)
  return (
    <button type="button" className="setting" role="switch" aria-checked={value} onClick={() => update({ [field]: !value })}>
      <span>
        <span className="setting__label">{label}</span>
        <span className="setting__hint">{hint}</span>
      </span>
      <span className={`switch ${value ? 'switch--on' : ''}`} />
    </button>
  )
}

/** Settings, printed on the floor inside the cargo bay. */
export function SettingsPanel() {
  const units = useAppStore((s) => s.settings.units)
  const update = useAppStore((s) => s.updateSettings)

  return (
    <div className="decal decal--interior">
      <h2 className="decal__title">Settings</h2>

      <div className="setting setting--static">
        <span>
          <span className="setting__hint">Delivering to</span>
          <span className="setting__label">South 40, dorm lobby</span>
        </span>
        <button type="button" className="link-button">Change</button>
      </div>

      <h3 className="decal__heading">Notifications and safety</h3>
      <Toggle field="notifications" label="Arrival alerts" hint="Get a ping when your robot pulls up" />
      <Toggle field="handoffPin" label="Ask for a PIN" hint="Enter a code before the lid unlocks" />

      <h3 className="decal__heading">Display</h3>
      <Toggle field="reducedMotion" label="Reduce motion" hint="Shorter, simpler transitions" />
      <div className="setting setting--static">
        <span className="setting__label">Distance</span>
        <span className="segmented" role="radiogroup" aria-label="Distance units">
          {(['mi', 'km'] as const).map((u) => (
            <button key={u} type="button" role="radio" aria-checked={units === u} className={units === u ? 'segmented--on' : ''} onClick={() => update({ units: u })}>
              {u === 'mi' ? 'Miles' : 'Kilometers'}
            </button>
          ))}
        </span>
      </div>

      <p className="decal__footer">GrubHub account not linked yet</p>
    </div>
  )
}
