import React from 'react'
import { ColorRing } from 'react-loader-spinner'

const ButtonLoader = () => {
    return (
        <ColorRing
            visible={true}
            height="35"
            width="35"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#fffff', '#fffff', '#fffff', '#fffff', '#fffff']}
        />
    )
}

export default ButtonLoader
