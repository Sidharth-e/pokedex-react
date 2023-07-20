import './loader.css'
import Logo from '../assets/pokeball.svg'
export default function Loader(){
    return(
        <>
        <img className="logo" src={Logo} alt="logo"/>
        </>
    )
}