import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaArrowRight } from "react-icons/fa"
import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from '../components/core/HomePage/Button'
import Banner from "../assets/Images/banner.mp4"
import CodeBlocks from '../components/core/HomePage/CodeBlocks'

const Home = () => {
    return (
        <>
            {/* Section1 */}
            <section className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between '>

                <Link to={"/signup"}>

                    <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit'>
                        <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                        transition-all duration-200 group-hover:bg-richblack-900'>
                            <p>Become an instructor</p>
                            <FaArrowRight />
                        </div>
                    </div>

                </Link>

                <div className='mt-7 text-center text-4xl font-semibold'>
                    Empower Your Future with
                    <HighlightText text={"Coding Skills"} />
                </div>

                <div className='w-[90%] text-center mt-4 text-lg font-bold text-richblack-300'>
                    {/* Get Text from Figma file */}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis vitae, debitis ratione distinctio aut, quo quasi sint quam at numquam libero mollitia id officiis sed magni, quos commodi delectus ipsa.
                </div>

                <div className="flex flex-row gap-7 mt-8">
                    {/* STYLE BUTTONS MORE ACCORDING TO FIGMA FILE */}
                    <CTAButton active={true} linkto={"/signup"}>
                        Learn More
                    </CTAButton>

                    <CTAButton active={false} linkto={"/login"}>
                        Book a Demo
                    </CTAButton>
                </div>

                {/* Add shadows, top - faded, right, bottom - white solid */}
                <div className='shadow-blue-200 mx-3 my-12'>
                    <video
                        muted
                        loop
                        autoPlay
                    >
                        <source src={Banner} type="video/mp4" />
                    </video>
                </div>

                {/* Code Section 1 */}
                <div>
                    <CodeBlocks
                        position={"lg:flex-row"}
                        heading={
                            <div className='text-4xl font-semibold'>
                                Unlock Your
                                <HighlightText text={"coding potential"} />
                                with our online courses
                            </div>
                        }
                        subheading={"Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."}
                        ctabtn1={
                            {
                                btnText: "Try it yourself",
                                linkto: "/signup",
                                active: true
                            }
                        }
                        ctabtn2={
                            {
                                btnText: "Learn More",
                                linkto: "/login",
                                active: false
                            }
                        }
                        codeblock={`<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n<link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav>\n<a href="one/">One</a><a href="two/">Two</a><a href="three/">Three</a></nav>\n</body>`}
                        codeColor={"text-yellow-25"}
                    />
                </div>

                {/* Code Section 2 */}
                <div>
                    <CodeBlocks
                        position={"lg:flex-row-reverse"}
                        heading={
                            <div className='text-4xl font-semibold'>
                                Start
                                <HighlightText text={"coding in seconds"} />
                            </div>
                        }
                        subheading={"Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."}
                        ctabtn1={
                            {
                                btnText: "Continue Lesson",
                                linkto: "/signup",
                                active: true
                            }
                        }
                        ctabtn2={
                            {
                                btnText: "Learn More",
                                linkto: "/login",
                                active: false
                            }
                        }
                        codeblock={`<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n<link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav>\n<a href="one/">One</a><a href="two/">Two</a><a href="three/">Three</a></nav>\n</body>`}
                        codeColor={"text-yellow-25"}
                    />
                </div>

            </section>

            {/* Section2 */}

            {/* Section3 */}

            {/* Footer */}

        </>
    )
}

export default Home
