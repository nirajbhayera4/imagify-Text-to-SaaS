import React from 'react'
import { stepsData } from '../assets/icons/assets'

const Steps = () => {
  return (
    <div><h1 className='text-3xl sm:text-4xl font-semibold mb-2'>How it works</h1><p className='text-lg text-gray-600 mb-8'>Tranform Words Into Stunning Images </p><div>{stepsData.map((item,index)=>(
        <div key={index}><img src={item.icon} alt="" />
        <div>
            <h2>{item.title}</h2>
            <p>{item.description}</p></div></div>
    ))}</div></div>
  )
}

export default Steps