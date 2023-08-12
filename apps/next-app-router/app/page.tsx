import { Timestamp } from 'ui/react'
import RefreshButton from './RefreshButton'
import Variant from './Variant'

export default function Page() {
  return (
    <Variant>
      <Timestamp date={new Date()} />
      <RefreshButton />
    </Variant>
  )
}
