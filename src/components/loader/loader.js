import './loader.css'
import Logo from '../assets/pokeball.svg'
export default function Loader(){
    return(
        <div className='loading-container'>
        <img className="logo" src={Logo} alt="logo"/>
        </div>
    )
}