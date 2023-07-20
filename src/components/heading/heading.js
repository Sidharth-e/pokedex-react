import Logo from '../assets/pokeball.svg'
import './heading.css'
export default function Heading(){
    return(
        <div className='heading'>
        <img className="heading-logo" src={Logo} alt='logo'/>
        <h1>AlphaDex</h1>
        </div>
    )
}