class CustomOption{
    constructor({tag, style, colorOn,colorOff, content, value, event, name}){
        this.element = document.createElement(tag || 'li') 
        this.element.dataset.value = value
        this.element.dataset.content = content || value

        this.colorOn = colorOn || '#5C5C5C'
        this.colorOff = colorOff || 'rgba(0,0,0,.54)'

        this.point = document.createElement('div') 
        this.pointBorder = document.createElement('div') 
        this.pointInt = document.createElement('div') 
        this.text = document.createElement('span')

        this.event = new CustomEvent(event || 'optionclick', {scoped: true, composed: true, bubbles: true, detail: {value: this.element.dataset.value, name, content: this.element.dataset.content}})

        this.init(style)
    }
    init(style){
        this.setStyles(style)
        this.insertDom()
        this.events()
    }
    setStyles(style){
        this.element.className = 'optListItem';
        this.point.className = 'optItemPoint';
        this.pointBorder.className = 'optItemPointBorder';
        this.pointInt.className = 'optItemPointInt';
        this.text.className = 'optItemText';

        this.pointBorder.style.setProperty('border',`2px solid ${this.colorOff}`)
        this.pointInt.style.setProperty('background',`${this.colorOn}`)

        if ( Util.isMobi() )
        {

        }
        else
        {

        }

        //
        if(style == 'simple'){
            this.point.style.setProperty('display','none')
            this.element.style.setProperty('margin','0 auto')
            this.text.style.setProperty('text-align','center')
            this.text.style.setProperty('font-size','21px')
            this.text.style.setProperty('margin','0 auto')
            this.element.style.setProperty('width','51%')
        }
    }
    insertDom(){
        this.pointBorder.appendChild(this.pointInt)
        this.point.appendChild(this.pointBorder)
        
        this.text.innerText=this.element.dataset.content

        this.element.appendChild(this.point)
        this.element.appendChild(this.text)        

    }
    events(){
        $(this.element).click((e)=>{
            this.element.dispatchEvent(this.event)
            if(window.getComputedStyle(this.pointInt).display === 'none'){
                this.select()
            }else{
                this.unselect()
            }
        });
    }
    select(){
        this.pointInt.style.setProperty('display','block')
        this.pointBorder.style.setProperty('border-color',this.colorOn)
        this.text.style.setProperty('font-weight','bolder')
    }
    unselect(){
        this.pointInt.style.setProperty('display','none')
        this.pointBorder.style.setProperty('border-color',this.colorOff)
        this.text.style.setProperty('font-weight','normal')
    }
    hide(){
        this.element.style.setProperty('display','none')
    }
    show(){
        this.element.style.setProperty('display','flex')
    }
}

class OptionsManager{
    constructor({name,data,search,optionStyle}){
        this.optionStyle = optionStyle
        this.name = name || 'none'
        this.element = document.createElement('div')
        this.options = []
        this.init(data,search)
    }
    init(data,search){
        this.createElements(search)
        this.generateOptions(data)
        this.setStyles()
        this.event()
    }
    createElements(search){
        this.ul = document.createElement('ul')
        this.ul.className = 'optItem'

        if(search){
            this.searchBar = document.createElement('div')
            this.inputSearch = document.createElement('input')
            var imgSearch = document.createElement('img')
            
            imgSearch.className = 'imgSearchOpts';
            imgSearch.src = 'images/search.svg'
            
            this.inputSearch.placeholder = 'Search'
            this.inputSearch.className = 'optInputSearch'
            this.searchBar.className = 'optSearchBar'

            
            this.searchBar.appendChild(this.inputSearch)
            this.searchBar.appendChild(imgSearch)

            this.element.appendChild(this.searchBar)
        }
        if(this.optionStyle == 'simple'){
            this.decorationLinesTop = document.createElement('hr')
            this.decorationLinesBottom = document.createElement('hr')
            this.element.appendChild(this.decorationLinesTop)
            this.element.appendChild(this.decorationLinesBottom)
        }
        this.element.appendChild(this.ul)
    }
    generateOptions(array){
        if(this.optionStyle == 'simple'){
            var fillerBox = document.createElement('div')
            fillerBox.style.setProperty('height','36px')
            this.ul.appendChild(fillerBox)
        }
        array.forEach((item,index)=>{
            var objectOption = {}
    
            if(typeof item === 'function' || typeof item === 'object' && !! item){
                objectOption.value = item.value
                objectOption.content = item.content
            }else{
                objectOption.value = item
            }
            objectOption.style=this.optionStyle
            objectOption.name=this.name
            var option = new CustomOption(objectOption)
            this.options[objectOption.value] = option
            this.ul.appendChild(option.element)
        })
    }
    event(){
        this.element.addEventListener('optionclick',e=>{
            if(e.detail.name == this.name){
                this.options[this.element.dataset.value] ? 
                    this.options[this.element.dataset.value].unselect() : null
                this.element.dataset.value=e.detail.value
                this.element.dataset.content=e.detail.content
            }
        })
        if(this.optionStyle == 'simple')
        $(this.ul).click( e=>
            {
            if(e.srcElement.tagName=='SPAN'){
                var index = Array.from(this.ul.children).findIndex(li=>{
                    return li.querySelector('span')==e.srcElement
                })
                this.ul.scrollTop = 50*parseFloat(index)-50  
            }
        })
        if(this.inputSearch)
        {
            this.inputSearch.addEventListener('keyup',e=>{
                const letras = e.target.value
                for(let prop in this.options){
                    let palabra = this.options[prop].element.dataset.content.toLowerCase()
                    if(!palabra.match(`.*${letras.toLowerCase()}.*`)){
                        this.options[prop].hide()
                    }else{
                        this.options[prop].show()
                    }
                }
            })
        }
    }
    setStyles(){
        $(this.element).css(
            {
                'padding':'16px',
                'width':'288px',
                'overflow':'hidden',
                'position':'relative',
                'height': '80%'
            }
        );
        if(this.optionStyle == 'simple'){
            $(this.decorationLinesTop).css(
                {
                    'background':'black',
                    'border':'none',
                    'height':'2px',
                    'width':'80px',
                    'position':'absolute',
                    'top':'33%',
                    'left':'50%',
                    'transform':'translateX(-50%)',
                    'pointer-events':'none'
                }
            );
            $(this.decorationLinesBottom).css(
                {
                    'background':'black',
                    'border':'none',
                    'height':'1.5px',
                    'width':'80px',
                    'position':'absolute',
                    'top':'33%',
                    'left':'50%',
                    'transform':'translateX(-50%)',
                    'pointer-events':'none'
                }
            );

            $(this.element).css('height','150px');

            this.ul.scroll=18.5
        }
    }
    showAll(){
        for(let prop in this.options){
            this.options[prop].show();
        }
    }
}