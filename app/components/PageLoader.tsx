import React from 'react'
import { Rings } from 'react-loader-spinner'

const PageLoader = () => {
    return (
        <div className='flex itesm-center justify-center h-screen w-screen'>
            <Rings
                visible={true}
                height="80"
                width="80"
                color="#ec4899"
                ariaLabel="rings-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </div>
    )
}

export default PageLoader
