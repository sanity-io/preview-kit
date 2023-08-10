import { LiveQueryProviderProps } from '../types'

export interface LiveQueryProviderInternalProps extends LiveQueryProviderProps {
  GroqStoreProvider: React.ComponentType<LiveQueryProviderProps>
  LiveStoreProvider: React.ComponentType<LiveQueryProviderProps>
}
