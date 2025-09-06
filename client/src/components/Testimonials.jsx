import React from 'react'
import { testimonialsData, assets } from '../assets/icons/assets'

const Testimonials = () => {
    return (
        <div className='flex flex-col items-center justify-center my-20 py-12'>
            <h1 className='text-3xl sm:text-4xl font-semibold mb-2'>Customer testimonials</h1>
            <p className='text-gray-500 mb-12'>What Our Users Are Saying</p>
            <div className='flex flex-wrap gap-6'>
                {testimonialsData.map((testimonial, index) => (
                    <div key={index}>
                        <div>
                            <img src={testimonial.image} alt="" className='rounded-full w-14' />
                            <h2>{testimonial.name}</h2>
                            <p>{testimonial.role}</p>
                            <div className='flex mb-4'>
                                {Array(testimonial.stars).fill().map((_, i) => (
                                    <img key={i} src={assets.rating_star} alt="" />
                                ))}
                            </div>
                            <p>{testimonial.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonials