


QUnit.test('Test FormUtil - getFormCtrlTag, getFormCtrlTag', function( assert ){
   

    var formTag = $("<form></form>");

    // -------------------------------------------------------------------------------------------------
    // TEXT field - ( name="test1" )
    var inputTagHtml = `<input name="test1" type="text" class="dataValue displayValue">`;
    var ctrlTag1 = $(`<div class="fieldBlock field">
                        <div class="field__label">
                            <label class="displayName">TEXT field</label>
                        </div>
                        <div class="fiel__controls">
                            <div class="field__left">`
                                + inputTagHtml +
                            `</div>
                            <div class="field__right" style="display: none;"></div>
                        </div>
                    </div>` );

    formTag.append( ctrlTag1 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test1" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get TEXT field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "Test 1" );
    var value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "Test 1", "Get and Set data value of TEXT field successfully !!!" );



    // -------------------------------------------------------------------------------------------------
    // SINGLE CHECKBOX field - ( name="test2" )
    inputTagHtml = `<input type="checkbox" class="dataValue displayValue" id="opt_test2" name="test2">`;
    var ctrlTag2 = $(`<div class="checkbox fieldBlock">
                        <div class="checkbox__label"><label class="displayName">CHECKBOX field</label></div>
                        <div class="checkbox__wrapper listWrapper">
                            <div class="checkbox-col">
                                <div class="checkbox-group horizontal">`
                                    + inputTagHtml +
                                    `<label for="opt_democheckbox"></label>
                                </div>
                            </div>
                        </div>
                    </div>` );

    formTag.append( ctrlTag2 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test2" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get SINGLE CHECKBOX field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "true" );
    value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "true", "Get and Set data value of SINGLE CHECKBOX successfully !!!" );


    // -------------------------------------------------------------------------------------------------
    // RADIO field - ( name="test3" )
    inputTagHtml = `<input type="hidden" class="dataValue" name="test3">`;
    var ctrlTag3 = $(   `<div class="radiobutton fieldBlock">
                            <div class="radiobutton__label"><label class="displayName">RADIO field</label> </div>
                            <div class="radiobutton__wrapper listWrapper">
                                <div class="radiobutton-col">
                                    <div class="radio-group horizontal">
                                        <input type="radio" name="opt_radioOpt" id="opt_NO" value="NO">
                                        <label for="opt_NO">No option</label>
                                    </div>
                                    <div class="radio-group horizontal">
                                        <input type="radio" name="opt_radioOpt" id="opt_YES" value="YES">
                                        <label for="opt_YES">Yes option</label>
                                    </div>
                                </div>
                            </div>`
                            + inputTagHtml +
                        `</div>` );

    formTag.append( ctrlTag3 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test3" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get RADIO field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "YES" );
    value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "YES", "Get and Set data value of RADIO successfully !!!" );

    
    // -------------------------------------------------------------------------------------------------
    // MULTI_CHECKBOX ( DIALOG ) field - ( name="test4" )
    inputTagHtml = `<input name="test4" type="hidden" class="dataValue">`;
    var ctrlTag4 = $(   `<div class="fieldBlock field">
                            <div class="field__label">
                                <label class="displayName">MULTI_CHECKBOX field</label>
                            </div>
                            <div class="fiel__controls">
                                <div class="field__left">
                                    <input name="displayValue_test4" type="text" class="displayValue">`
                                   + inputTagHtml + 
                                `</div>
                            <div class="field__right" style="display: none;"></div>
                        </div>` );

    formTag.append( ctrlTag4 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test4" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get DIALOG_CHECKBOX field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "Option_1,Option_2" );
    value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "Option_1,Option_2", "Get and Set data value of DIALOG_CHECKBOX successfully !!!" );


    // -------------------------------------------------------------------------------------------------
    // CHECKBOX field - ( name="test5" )
    inputTagHtml = `<input type="hidden" class="dataValue" name="test5">`;
    var ctrlTag5 = $(   `<div class="checkbox fieldBlock">
                            <div class="checkbox__label"><label class="displayName">CHECKBOX field</label></div>
                            <div class="checkbox__wrapper listWrapper">
                                <div class="checkbox-col">
                                    <div class="checkbox-group horizontal">
                                        <input id="opt_Val1" type="checkbox" name="opt_test5" value="Option_3">
                                        <label for="opt_Val1">Value 2</label>
                                    </div>
                                    <div class="checkbox-group horizontal">
                                        <input id="opt_Val2" type="checkbox" name="opt_test5" value="Option_4">
                                        <label for="opt_Val2">Value 2</label>
                                    </div>
                                </div>
                            </div>`
                            + inputTagHtml +
                        `</div>` );

    formTag.append( ctrlTag5 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test5" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get CHECKBOXES field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "Option_3" );
    value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "Option_3", "Get and Set data value of CHECKBOXES successfully !!!" );

    
    // -------------------------------------------------------------------------------------------------
    // YEAR field - ( name="test6" )
    inputTagHtml = `<input type="number" class="inputTrue dataValue" name="test6">`;
    var ctrlTag6 = $(   `<div class="fieldBlock field">
                            <div class="field__label">
                                <label class="displayName" term="form_std_yearOfBirth_label">YEAR field</label>
                            </div>
                            <div class="fiel__controls">
                                <div class="field__left"><div class="containerSymbol fieldBlock">`
                                    + inputTagHtml +
                                    `<input type="number" class="inputShow displayValue isnumber="true" autocomplete="true" >
                                </div>
                            </div>
                            <div class="field__right" style="display: none;"></div>
                        </div>` );

    formTag.append( ctrlTag6 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test6" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get YEAR field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "2020" );
    value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "2020", "Get and Set data value of YEAR successfully !!!" );


    // -------------------------------------------------------------------------------------------------
    // DROPDOWN_LIST  - ( name="test7" )
    inputTagHtml = `<select name="test7" class="dataValue displayValue">
                        <option term="common_pleaseSelectOne">Choose an option</option>
                        <option value="val1">Value 1</option>
                        <option value="val2">Value 2</option>
                    </select>`;
    var ctrlTag7 = $(   `<div class="fieldBlock field">
                            <div class="field__label">
                                <label class="displayName" term="form_std_addressDistrict_label">DROPDOWN_LIST field</label>
                            </div>
                            <div class="fiel__controls">
                            <div class="field__selector">`
                                + inputTagHtml + 
                            `</div>
                            <div class="field__right" style="display: none;"></div>
                            </div>
                        </div>` );

    formTag.append( ctrlTag7 );
    var searchedTag = FormUtil.getFormCtrlTag( formTag, "test7" );
    assert.equal( searchedTag.outerHTML() == inputTagHtml, true, "Get DROPDOWN_LIST field successfully !!!" );

    FormUtil.setFormCtrlDataValue ( searchedTag, "val1" );
    value = FormUtil.getFormCtrlDataValue( searchedTag );
    assert.equal( value, "val1", "Get and Set data value of DROPDOWN_LIST successfully !!!" );

});



