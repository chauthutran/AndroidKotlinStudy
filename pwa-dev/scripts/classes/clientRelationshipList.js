
function ClientRelationshipList( _clientJson, _relationshipTabTag )
{
    var me = this;

    me.clientJson = _clientJson;
    me.relationshipTabTag =  _relationshipTabTag;


    // ----------------------------------------------------------------------------------------
    // Variables

    me.listTag;
    me.addRelationshipBtnTag;

    // ----------------------------------------------------------------------------------------
    // Init method

    me.initialize = function() 
    {
    }

    // ----------------------------------------------------------------------------------------

    me.getListTag = function()
    {
        return me.listTag;
    }

    // ----------------------------------------------------------------------------------------

    me.render = function()
    {
        // Reset things..  maybe simply clear it out?  
        me.relationshipTabTag.html( '' );
        //me.relationshipTabTag.find( 'div.block' ).remove();
        //me.listTag.remove();

        me.listTag = $( '<div class="list"></div>' );
        me.relationshipTabTag.append( me.listTag );

        me.renderRelationshipList( me.listTag, me.clientJson.relationships );

        var favIconsObj = new FavIcons( 'clientRelFav', me.listTag, me.relationshipTabTag );
        favIconsObj.render();

        //me.renderAddRelationshipBtn( me.listTag, me.relationshipTabTag );
    };

    // ----------------------------------------------------------------------------------------
    // Render methods

    me.renderRelationshipList = function( listTag, relationships )
    {
        // Render list of client relationship
        if ( relationships )
        {
            relationships.forEach( rel => 
            {
                var cardTag = me.renderRelationshipCard( rel );
                me.setUp_Events( cardTag );
    
                listTag.append( cardTag );    
            });
        }
    };


    me.renderAddRelationshipBtn = function( listTag, relationshipTabTag )
    {
        // Render [Add] button
        me.addRelationshipBtnTag = $( FavIcons.favButtonContainer );
        
        // Set Click event 
        me.addRelationshipBtnTag.click( function()
        {
            // clear existing data on this tab content
            relationshipTabTag.find( 'div.block' ).remove();
            relationshipTabTag.find( 'div.list' ).remove();

            var clientRelSearchBlock = ConfigManager.getConfigJson().settings.clientRelSearchBlock;
            FormUtil.renderBlockByBlockId( clientRelSearchBlock, SessionManager.cwsRenderObj, relationshipTabTag );
        
            //var searchClientRelationshipBlock_DefJson = ConfigManager.getConfigJson().definitionBlocks.blockSearchClientRelationship;
        });
        
        listTag.append( me.addRelationshipBtnTag );
    };


    me.renderRelationshipCard = function( relationship )
    {       
        var relClientJson = ClientDataManager.getClientById( relationship.clientId );

        var divClientCardTag = $( ClientCardTemplate.relationshipCardDivTag );
        divClientCardTag.attr( 'itemId', relationship.clientId );

        
        // Add Icon
        me.clientIconDisplay( divClientCardTag.find( ".clientIcon" ), relClientJson );


        // Set Content
        var divClientContentTag = divClientCardTag.find( ".clientContent" );     
        me.setRelContentDisplay( divClientContentTag, relationship, relClientJson );


        divClientContentTag.click( function( e ) 
        {
            e.stopPropagation();

            var clientCardDetail = new ClientCardDetail( relClientJson._id );
            clientCardDetail.render();
        });

        return divClientCardTag;
    };


    me.setRelContentDisplay = function( divContentTag, relationship, relClientJson )
    {
        try
        {            
            var displayBase = ConfigManager.getClientRelDisplayBase();
            var displaySettings = ConfigManager.getClientRelDisplaySettings();
            
            var relationshipCopy = Util.cloneJson( relationship );
            relationshipCopy.client = relClientJson;

            InfoDataManager.setINFOdata( 'relationship', relationshipCopy );

            FormUtil.setCardContentDisplay( divContentTag, displayBase, displaySettings, Templates.cardContentDivTag );
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR in clientCard.setClientContentDisplay, errMsg: ' + errMsg );
        }
    };

    
    // ----------------------------------------------------------------------------------------
    // Setup Edit / Delete a relationship events

    me.setUp_Events = function( cardTag )
    {
        // Add relationship
        cardTag.find(".fab-wrapper").click( function() {

        });

        cardTag.find(".editRelationship").click( function() {

        });

        cardTag.find(".deleteRelationship").click( function() {

            var clientFullName = me.getClientFullName( me.clientJson );
            var relClientId = cardTag.attr("itemId");

            var relationshipClientJson = ClientDataManager.getClientById( relClientId );
            var rlsFullName = me.getClientFullName( relationshipClientJson );

            var ok = window.confirm("Are you sure you want to delete the relationship of " + clientFullName + " and " + rlsFullName );
            if( ok )
            {
                me.removeRelationship( me.clientJson, relationshipClientJson );
            }
        });

    }

    // ----------------------------------------------------------------------------------------
    // Add / Edit / Delete a relationship function

    me.showEditRelationshipForm = function()
    {

    }

    me.editRelationship = function( clientJson, relationshipClientId )
    {
        
    }

    me.addRelationship = function( clientJson, relationshipClientId, relationshipType1, relationshipType2 )
    {
        clientJson.relationships.push( {"clientId" : relationshipClientId, "type": relationshipType1 } );

        var relationshipClientJson = ClientDataManager.getClientById( relObj.clientId );
        relationshipClientJson.relationships.push( {"clientId" : clientJson._id, "type": relationshipType2 } );
    }

    me.removeRelationship = function( clientJson, relClientJson )
    {
        Util.RemoveFromArray( clientJson.relationships, "clientId", relClientJson._id );
        Util.RemoveFromArray( relClientJson.relationships, "clientId", clientJson._id );
    }


    // ----------------------------------------------------------------------------------------
    // Supportive methods

    
    me.clientIconDisplay = function( clientIconTag, clientJson )
    {
        try
        {
            var iconName = ClientCardTemplate.cardIconTag.replace( '{NAME}', me.getNameSimbol( clientJson ) );

            var svgIconTag = $( iconName );

            clientIconTag.empty().append( svgIconTag );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ClientCard.clientTypeDisplay, errMsg: ' + errMsg );
        }        
    };   
    
    
    me.getNameSimbol = function( clientJson )
    {
        var nameSimbol = '--';

        try
        {
            if ( clientJson && clientJson.clientDetails )
            {
                var cDetail = clientJson.clientDetails;
    
                if ( cDetail.firstName || cDetail.lastName )
                {
                    var firstNameSimbol = ( cDetail.firstName ) ? cDetail.firstName.charAt(0) : '-';
                    var lastNameSimbol = ( cDetail.lastName ) ? cDetail.lastName.charAt(0) : '-';
    
                    nameSimbol = firstNameSimbol + lastNameSimbol;
                }
            }    
        }
        catch( errMsg )
        {
            console.log( 'ERROR in ClientCard.getNameSimbol(), errMsg: ' + errMsg );
        }
        
        return nameSimbol;
    };

    me.getClientFullName = function( clientJson )
    {
        var fullName = '- -';

        try
        {
            if ( clientJson && clientJson.clientDetails )
            {
                var cDetail = clientJson.clientDetails;
    
                if ( cDetail.firstName || cDetail.lastName )
                {
                    var firstName = ( cDetail.firstName ) ? cDetail.firstName : '-';
                    var lastName = ( cDetail.lastName ) ? cDetail.lastName : '-';
    
                    fullName = firstName + " " + lastName;
                }
            }    
        }
        catch( errMsg )
        {
            console.log( 'ERROR in ClientCard.getNameSimbol(), errMsg: ' + errMsg );
        }
        
        return fullName;
    };

    // ----------------------------------------------------------------------------------------
    // Run INIT method

    me.initialize();
}

