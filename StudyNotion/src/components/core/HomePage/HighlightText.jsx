import React from 'react'

const HighlightText = ({ text }) => {
    return (
        // use this type to set gradient bg-gradient-to-b from-[] to-[]
        <span className='font-bold text-richblue-500'>
            {" "}
            {text}
            {" "}
        </span>
    )
}

export default HighlightText
