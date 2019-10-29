class CustomOption{
    constructor({tag, style, colorOn,colorOff, content, value, event, name}){
        this.element = document.createElement(tag || 'li') 
        this.element.dataset.value = value
        this.element.dataset.content = content || value

        this.colorOn = colorOn || '#2C98F0'
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
        this.element.style.setProperty('height','50px')
        this.element.style.setProperty('display','flex')
        this.element.style.setProperty('align-items','center')
        this.element.style.setProperty('cursor','pointer')
        this.element.style.setProperty('padding-top','12px')
        this.element.style.setProperty('padding-bottom','12px')

        this.point.style.setProperty('box-sizing','border-box')
        this.point.style.setProperty('height','24px')
        this.point.style.setProperty('flex-shrink','0')
        this.point.style.setProperty('width','24px')
        this.point.style.setProperty('padding','2px')

        this.pointBorder.style.setProperty('box-sizing','border-box')
        this.pointBorder.style.setProperty('border-radius','50%')
        this.pointBorder.style.setProperty('height','100%')
        this.pointBorder.style.setProperty('border',`2px solid ${this.colorOff}`)
        this.pointBorder.style.setProperty('padding','3px')

        this.pointInt.style.setProperty('display','none')
        this.pointInt.style.setProperty('box-sizing','border-box')
        this.pointInt.style.setProperty('border-radius','50%')
        this.pointInt.style.setProperty('height','100%')
        this.pointInt.style.setProperty('background',`${this.colorOn}`)

        this.text.style.setProperty('font-size','14px')
        this.text.style.setProperty('font-family',"'Rubik', Arial")
        this.text.style.setProperty('margin-left','24px')
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
        this.element.addEventListener('click',e=>{
            this.element.dispatchEvent(this.event)
            if(window.getComputedStyle(this.pointInt).display === 'none'){
                this.select()
            }else{
                this.unselect()
            }
        })
    }
    select(){
        this.pointInt.style.setProperty('display','block')
        this.pointBorder.style.setProperty('border-color',this.colorOn)
        this.text.style.setProperty('color',this.colorOn)
        this.text.style.setProperty('font-weight','bolder')
    }
    unselect(){
        this.pointInt.style.setProperty('display','none')
        this.pointBorder.style.setProperty('border-color',this.colorOff)
        this.text.style.setProperty('color','black')
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
        this.ul.style.setProperty('padding','0')
        this.ul.style.setProperty('height','240px')
        this.ul.style.setProperty('overflow-y','scroll')

        if(search){
            this.searchBar = document.createElement('div')
            this.inputSearch = document.createElement('input')
            var imgSearch = document.createElement('img')
            
            imgSearch.src = window.location.href+'images/search.svg'
            
            this.inputSearch.placeholder = 'Search'
            this.inputSearch.style.setProperty('border-radius','16px')
            this.inputSearch.style.setProperty('width','256px')
            this.inputSearch.style.setProperty('outline','none')
            this.inputSearch.style.setProperty('padding','4px')
            this.inputSearch.style.setProperty('padding-left','28px')
            this.inputSearch.style.setProperty('border','1px solid black')

            imgSearch.style.setProperty('height','24px')
            imgSearch.style.setProperty('position','absolute')
            imgSearch.style.setProperty('left','4px')
            imgSearch.style.setProperty('top','2px')

            this.searchBar.style.setProperty('width','100%')
            this.searchBar.style.setProperty('position','relative')
            this.searchBar.style.setProperty('margin-bottom','24px')
            
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
        this.ul.addEventListener('click',e=>{
            if(e.srcElement.tagName=='SPAN'){
                var index = Array.from(this.ul.children).findIndex(li=>{
                    return li.querySelector('span')==e.srcElement
                })
                this.ul.scrollTop = 50*parseFloat(index)-50  
            }
        })
        if(this.inputSearch){
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
        this.element.style.setProperty('padding','16px')
        this.element.style.setProperty('width','288px')
        this.element.style.setProperty('overflow','hidden')
        this.element.style.setProperty('position','relative')
        if(this.optionStyle == 'simple'){
            this.decorationLinesTop.style.setProperty('background','black')
            this.decorationLinesTop.style.setProperty('border','none')
            this.decorationLinesTop.style.setProperty('height','2px')
            this.decorationLinesTop.style.setProperty('width','80px')
            this.decorationLinesTop.style.setProperty('position','absolute')
            this.decorationLinesTop.style.setProperty('top','33%')
            this.decorationLinesTop.style.setProperty('left','50%')
            this.decorationLinesTop.style.setProperty('transform','translateX(-50%)')
            this.decorationLinesTop.style.setProperty('pointer-events','none')
            
            this.decorationLinesBottom.style.setProperty('background','black')
            this.decorationLinesBottom.style.setProperty('border','none')
            this.decorationLinesBottom.style.setProperty('height','1.5px')
            this.decorationLinesBottom.style.setProperty('width','80px')
            this.decorationLinesBottom.style.setProperty('position','absolute')
            this.decorationLinesBottom.style.setProperty('bottom','33%')
            this.decorationLinesBottom.style.setProperty('left','50%')
            this.decorationLinesBottom.style.setProperty('transform','translateX(-50%)')
            this.decorationLinesBottom.style.setProperty('pointer-events','none')

            this.element.style.setProperty('height','150px')

            this.ul.scroll=18.5
        }
    }
    showAll(){
        for(let prop in this.options){
            this.options[prop].show()
        }
    }
}