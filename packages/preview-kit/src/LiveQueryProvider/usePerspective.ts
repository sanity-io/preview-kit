import {createNode, createNodeMachine} from '@sanity/comlink'
import {
  createCompatibilityActors,
  type LoaderControllerMsg,
  type LoaderNodeMsg,
} from '@sanity/presentation-comlink'
import {useEffect, useState} from 'react'
import isEqual from 'react-fast-compare'

import type {ValidPerspective} from '../types'

export function usePerspective(initialPerspective: ValidPerspective): ValidPerspective {
  const [presentationPerspective, setPresentationPerspective] = useState<ValidPerspective | null>(
    null,
  )

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

    comlink.on('loader/perspective', ({perspective}) => {
      if (perspective !== 'raw') {
        setPresentationPerspective((prev) => (isEqual(prev, perspective) ? prev : perspective))
      }
    })

    const stop = comlink.start()
    return () => stop()
  }, [])
  return presentationPerspective === null ? initialPerspective : presentationPerspective
}
