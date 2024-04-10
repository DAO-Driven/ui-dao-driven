import github_icon from '../data/photos/github/github-icon.png';
import telegram_icon from "../data/photos/github/telegram-icon.png"
import discord_icon from "../data/photos/github/discord-icon.png"

const Footer = () => {

  const isMobile = (window.innerWidth <= 768);
  const h2Style = isMobile ? {fontSize: '27px', "margin-top": "15%"} : {fontSize: '32px', "margin-top": "15%"};

  
  return (
    <div id='footer'>
        <div className='container text-center'>
          <h3 tyle={h2Style}>Docs</h3>
          <div className='contact-item'>
            <p>
              <span className="center-icon">
                <a href="https://github.com/DAO-Driven/dao-driven-core" target="_blank" rel="noopener noreferrer">
                  <img src={github_icon} alt="GitHub Icon" width="52" height="52" />
                </a>
              </span>
            </p>
          </div>

          <div className='contact-item'>
            <p>
              <span className="center-icon">
                <a href="https://discord.com/users/958383531854270474" target="_blank" rel="noopener noreferrer">
                  <img src={discord_icon} alt="GitHub Icon" width="52" height="52" />
                </a>
              </span>
            </p>
          </div>
        </div>
    </div>
  )
}

export const Contact = (props) => {

  return (
    <div>
      

      <Footer />

    </div>
  )
}
