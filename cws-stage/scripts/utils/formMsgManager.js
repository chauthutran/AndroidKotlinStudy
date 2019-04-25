function FormMsgManager(){}
FormMsgManager.cssBlock_Body={border:'none',padding:'15px 10px','-webkit-border-radius':'4px','-moz-border-radius':'4px',opacity:.9,position:'absolute',color:'#50555a','left':'50%','top':'50%','width':'70px','height':'74px','margin-left':(($('nav.bg-color-program').width()<=450&&($(document).height()<=1000))?'-10%':(($('nav.bg-color-program').width()<=1000)?'-5%':'-3%')),'margin-top':(($(document).height()<=650&&$('nav.bg-color-program').width()<=800)?'-11%':(($(document).height()<=1000)?'-6%':'-3%')),'white-space':'normal',overflow:'display',border:'2px solid rgb(255, 255, 255)',verticalAlign:'middle',fontSize:'0.8em'};FormMsgManager.block=function(block,msg,cssSetting,tag)
{var msgAndStyle={message:msg,css:cssSetting};if(tag===undefined)
{if(block)$.blockUI(msgAndStyle);else $.unblockUI()}
else{if(block)tag.block(msgAndStyle);else tag.unblock()}}
FormMsgManager.appBlock=function(msg)
{if(!msg)msg="Processing..";FormMsgManager.block(!0,msg,FormMsgManager.cssBlock_Body)};FormMsgManager.appUnblock=function()
{FormMsgManager.block(!1)}