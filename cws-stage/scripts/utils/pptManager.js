class Modal{
    constructor(object = {
                parent: undefined,
                customElement: undefined,
                titleMessage:undefined,       
                bodyMessage:undefined,
                questionMessage:undefined,
                buttons:undefined,
                typeModal:undefined,
                positionZ:undefined,
                passive:false}){
        this.parent = object.parent
        this.passive = object.passive
        this.typeModal = object.typeModal
        this.positionZ = object.positionZ | 1000
        this.status = false
        this.data = {
            title: object.titleMessage,
            body: object.bodyMessage,
            question: object.questionMessage
        }
        this.elements = {
            container: undefined,
            content: undefined,
            title: undefined,
            body: undefined,
            question: undefined,
            customElement: object.customElement,
            containerButtons: undefined,
            buttons: (function(){
                if(object.buttons){
                    if(Array.isArray(object.buttons)){
                        return object.buttons
                    }else{
                        return [object.buttons]
                    }
                }else{
                    return []
                }
            })()
        }
        this.initialize()
    }
    createElements(){
        // Los botones no son creados. Son extraidos del parámetro 
        this.elements.container = document.createElement('div')
        this.elements.content = document.createElement('div')
        this.elements.containerButtons = document.createElement('div')
        this.elements.title = document.createElement('strong')
        this.elements.body = document.createElement('div')
        this.elements.question = document.createElement('span')
    }
    insertData(datos){
        for(let el in this.data){
            if( this.data[el] ){
                this.elements[el].innerText=this.data[el]
            }
        }
    }
    //  Inicializa estilos necesarios al elemento modal
    initializeStylesContainer(){
        let container = this.elements.container;
        container.className = 'pptContainer';
        container.style.setProperty('z-index',`${this.positionZ}`)
    }
    //  Inicializa estilos necesarios al contenido del modal
    initializeStylesContent(){
        let content = this.elements.content,
            title = this.elements.title,
            body = this.elements.body,
            question = this.elements.question;

        content.className = 'pptContent';

        if ( title )
        {
            title.className = 'pptTitle';
            
        }
        if ( body )
        {
            body.className = 'pptBody';
        }
        if ( question )
        {
            question.className = 'pptQuestion';
        }
        
    }
    //  Llama a inicializar todos los estilos necesarios
    initializeStyles(){
        this.initializeStylesContainer()
        this.initializeStylesContent()
    }
    insertElementsDOM(){
        this.elements.container.appendChild(this.elements.content)

        this.elements.content.appendChild(this.elements.title)
        this.elements.content.appendChild(this.elements.body)
        if ( this.elements.customElement )
          this.elements.content.appendChild(this.elements.customElement)
        this.elements.content.appendChild(this.elements.containerButtons)

        this.elements.body.appendChild(this.elements.question)
        this.elements.buttons.forEach(button=>{
            this.elements.containerButtons.appendChild(button)
        })
        
        this.parent 
            ?   this.parent.appendChild(this.elements.container)
            :   document.body.appendChild(this.elements.container)
    }

    initialize(){
        let self = this
        this.createElements()
        this.insertData()
        this.initializeStyles()
        this.insertElementsDOM()
        this.initializeEvents()
        if(!this.passive){    
            this.exec()
        }
        return self
    }

    //  Sólo abre modal.
    showModal(){
        if(!this.status){
            this.elements.container.style.setProperty('display','flex')
            this.status = true  
        }
    }
    //  Sólo cierra modal
    hideModal(){
        if(this.status){
            this.elements.container.style.setProperty('display','none')
            this.status = false
        }
    }
    exec(){
        //  Abre o cierra el modal dependiendo del estado this.status
        this.status ? this.hideModal() : this.showModal()  
    }
    updateModal(datos, hardChange){
        // datos debe ser un objeto
        if(datos){
            let objeto = {}
            for(let el in datos){
                switch(el){
                    case 'titleMessage':
                        objeto.title=datos[el]
                        break
                    case 'bodyMessage':
                        objeto.body=datos[el]
                        break
                    case 'questionMessage':
                        objeto.question=datos[el]
                        break              
                }
            }
            if(hardChange){
                for(let el in this.data){
                    if(objeto[el]){
                        this.data[el]=objeto[el]
                        if(el == 'body'){
                            this.elements[el].innerText=''
                            this.elements[el].insertAdjacentText('afterbegin',objeto[el])
                            this.elements['body'].insertAdjacentElement('beforeend',this.elements['question'])
                        }else if(el == 'question'){
                            this.elements[el].innerText=objeto[el]
                        }else{
                            this.elements[el].innerText=objeto[el]
                        }
                    }else{
                        this.data[el]=''
                        this.elements[el].innerText=''
                    }
                }
            }else{
                for(let el in objeto){
                    this.data[el]=objeto[el]
                    if(el == 'body'){
                        this.elements[el].insertAdjacentText('afterbegin',objeto[el])
                    }else{
                        this.elements[el].innerText=objeto[el]
                    }
                }
            }
        }else{
            for(let el in this.data){
                this.data[el]=''
                this.elements[el].innerText=''
            }
        }
        if(datos.buttons){
            this.elements.containerButtons.innerHTML = ''
            this.elements.buttons=[]
            datos.buttons.forEach(button=>{
                this.elements.buttons.push(button) 
                this.elements.containerButtons.appendChild(button)
            })
        }
    }

    //  Inicializa los eventos
    initializeEvents(){
        // Por el momento sólo el evento click fuera del contenido para cerrar la ventana modal
        let self = this
        let container = this.elements.container
        container.addEventListener('click',function(e){
            if(e.target == this){
                self.exec()
            }
            this.status = !this.status
        },false)
    }
}

class InterfaceModal{
    constructor(object){
        this.modals=[{positionZ: undefined, modal: undefined}]
        this.higherPositionZ
        this.created=false  //  Seguridad: Evita que se inicialice el mismo objeto varias veces **
        this.initialize(object)
    }
    initialize(object){
        //  Si no está inicializado/creado crea una interface y un modal Default
        if(!this.created){  //  Seguridad: Evita que se inicialice el mismo objeto varias veces **
            let self = this
            let newModal = new Modal(object)
            this.higherPositionZ = 1000
            this.modals[0]={positionZ: this.higherPositionZ,modal:newModal}
            this.created = true
            return self
        } 
    }
    on(object,value){
        if(value){
            let newModal, valPositionZ
            if(!object.positionZ){
                valPositionZ = this.higherPositionZ + 1
                this.higherPositionZ = valPositionZ
                newModal = new Modal({positionZ:valPositionZ,...object})
            }else{
                valPositionZ = object.positionZ
                newModal = new Modal(object)
            } 
            this.modals.push({positionZ: valPositionZ,modal: newModal})
            return newModal
        }else{
            this.modals[0].modal.updateModal(object, true)
            this.modals[0].modal.exec()
            return this.modals[0].modal
        }
    }
}

var pptManager = new InterfaceModal({passive:true})

//
/*
    new InterfaceModal()return Interface Controller of Modals. (one is enough for the application)
    var Modals = new InterfaceModal()
        Generate in Modals a objecto Modal by default. 
        The element managment by object Modal in Modals will re-use updating new data in Modals.on({data}) 
        
        If i want to create a new element Modal? Insert true by second param.
            -> Modals.on({data},true)
            Recomend:
            -> var modal2 = Modals.on({data},true)
                Use:
                -> modal2.exec() -> toogle of Hide/Show
                -> modal2.showModal()
                -> modal2.hideModal()
    var modal = new Modal () --> return Modal   
        Recommedation: Use just by Interfacemodal.on()

*/