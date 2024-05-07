import React, { useCallback,  useState } from 'react';
import './style.css';
import "quill/dist/quill.snow.css"
import Quill from "quill";

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function ExcelEditor() {

const ROWS = 10
const COLS=10
const [quill, setQuill] = useState<any>(null)

const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

class Cell{
     isHeader:boolean;
     disabled:boolean;
     data:any;
     row:number;
     column:number;
     rowName:string|number; 
     columnName:string|number;
     active:boolean;

    constructor(isHeader:boolean, disabled:boolean, data:any, row:number, column:number, rowName:string|number, columnName:string|number, active:boolean = false){
        this.isHeader =isHeader
        this.disabled =disabled
        this.data =data
        this.row =row
        this.column =column
        this.rowName =rowName
        this.columnName =columnName
        this.active =active
    }
}

const spreadsheet:Cell[][]=[]

const wrapperRef = useCallback((wrapper: HTMLDivElement) => {
        if (wrapper == null) return
        wrapper.innerHTML = ""

        const spreadSheetContainer = document.createElement('div')
      
        wrapper.append(spreadSheetContainer)
        const q = new Quill(spreadSheetContainer, { theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS } })
        setQuill(q)

       let posButton = document.createElement('span');
        posButton.classList.add(
            'ql-formats'
        );
        posButton.setAttribute('id', 'export-btn');
        //posButton.setAttribute('class', 'export-btn');
        let customButton = document.createElement('button');
        customButton.innerHTML = 'Save';
       // customButton.addEventListener('click', function () {

         //   saver(q);
        //});

        customButton.classList.add(
            'ql-align',
            'ql-picker',
            'ql-icon-picker',
            'ql-save'
        );
        customButton.style.width = '70px';
        posButton.appendChild(customButton);
        const doc = document.getElementById("spreadsheet-container");
        if (doc?.hasChildNodes) {
            const panel = doc.getElementsByTagName('div')[0];
            panel.appendChild(posButton);
        }
       // const exportBtn = document.querySelector("#export-btn")

posButton.onclick = function(e){
    let csv = ''
    console.log(spreadsheet)
        for(let i = 0; i < spreadsheet.length; i++){
           csv += 
                spreadsheet[i]
                    .filter((item) => !item.isHeader)
                    .map((item) => item.data)
                    .join(",") + "\r\n"
    }

    const csvObj = new Blob([csv])
    const csvUrl = URL.createObjectURL(csvObj)
    console.log("csv", csvUrl)

    const a = document.createElement('a')
    a.href = csvUrl
    a.download = 'Exported Spreadsheet.csv'
    a.click()
}

initSpreadsheet()

function initSpreadsheet(){
    for (let i=0; i< COLS; i++){
        let spreadsheetRow:Cell[] = []
        for (let j=0; j< COLS; j++){
            let cellData:string|number = "";
            let isHeader = false;
            let disabled = false
            if(j===0){
                cellData=i
                isHeader = true
                disabled = true
            }
            if(i===0){
                isHeader = true
                disabled = true
                cellData = alphabets[j-1]
            }

            if (!cellData){
                cellData = ""
            }
            const rowName = i
            const columnName = alphabets[j-1]
            const cell = new Cell(isHeader, disabled, cellData, i, j, rowName, columnName, false)
            spreadsheetRow.push(cell)
        }
        spreadsheet.push(spreadsheetRow)
    }
    drawSheet()
}

function drawSheet(){
    spreadSheetContainer.innerHTML =""
    for(let i = 0; i < spreadsheet.length; i++){
            const rowContainerEl = document.createElement('div')
            rowContainerEl.className = "cell-row"
            for(let j = 0; j < spreadsheet[i].length; j++){
                const cell = spreadsheet[i][j];
               rowContainerEl.append(createCellEl(cell));
         }
        spreadSheetContainer.append(rowContainerEl)
    }
}

function createCellEl(cell:Cell){
    const cellEl = document.createElement("input")
    cellEl.className = "cell"
    cellEl.id = "cell_" + cell.row + cell.column
    cellEl.value = cell.data
    cellEl.disabled = cell.disabled

    if (cell.isHeader){
        cellEl.classList.add("header")
    }

    cellEl.onclick = () => handleCellClick(cell)
    cellEl.onchange = (e:any) => handleOnChange(e.target.value, cell)
    return cellEl
}

function handleCellClick(cell:Cell){
    clearHeaderActiveStates();
    const columnHeader = spreadsheet[0][cell.column]
    const rowHeader = spreadsheet[cell.row][0]
    const columnHeaderEl = getElFromRowCol(columnHeader.row, columnHeader.column)
    const rowHeaderEl = getElFromRowCol(rowHeader.row, rowHeader.column)
    columnHeaderEl?.classList.add('active')
    rowHeaderEl?.classList.add('active')
}

function handleOnChange(data:any,cell: Cell){
    cell.data=data
}

function clearHeaderActiveStates(){
    for(let i = 0; i < spreadsheet.length; i++){
            for(let j = 0; j < spreadsheet[i].length; j++){
                const cell = spreadsheet[i][j]
                if(cell.isHeader){
                    let cellEl = getElFromRowCol(cell.row, cell.column)
                    cellEl?.classList.remove("active")
                }
         }
    }
}

function getElFromRowCol(row:string|number, col:string|number){
   return document.querySelector('#cell_' + row +col)
}

   }, [])

        return (
        <div className="spreadsheet-container"  id="spreadsheet-container" ref={wrapperRef}></div>

    )
}