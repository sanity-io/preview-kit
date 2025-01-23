import type {ClientPerspective} from '@sanity/client'
import {createNode, createNodeMachine} from '@sanity/comlink'
import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@sanity/presentation-comlink'
import {useEffect, useState} from 'react'

export function usePerspective(
  initialPerspective: Exclude<ClientPerspective, 'raw'>,
): Exclude<ClientPerspective, 'raw'> {
  const [presentationPerspective, setPresentationPerspective] = useState<Exclude<
    ClientPerspective,
    'raw'
  > | null>(null)

  useEffect(() => {
    const comlink = createNode<LoaderNodeMsg, LoaderControllerMsg>(
      {
        name: 'loaders',
        connectTo: 'presentation',
      },
      createNodeMachine<LoaderNodeMsg, LoaderControllerMsg>().provide({
        actors: createCompatibilityActors<LoaderNodeMsg>(),
      }),
    )

    comlink.on('loader/perspective', (data) => {
      if (data.perspective !== 'raw') {
        setPresentationPerspective(data.perspective)
      }
    })

    const stop = comlink.start()
    return () => stop()
  }, [])
  return presentationPerspective === null ? initialPerspective : presentationPerspective
}
