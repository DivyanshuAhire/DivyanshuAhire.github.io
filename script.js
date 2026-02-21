function calc(operator)
{
    const num1=parseFloat(document.getElementById("firstNum").value);
    const num2=parseFloat(document.getElementById("secondNum").value);

    const finalAnswer = document.getElementById("answer");

    let AnswerVal;
    if (operator==="+") AnswerVal=num1 + num2;
    else if ( operator==="-")
    {
        AnswerVal=num1-num2;
    }
    else if ( operator==="*")
    {
        AnswerVal=num1*num2;
    }
    else if ( operator==="/")
    {
        if(num2===0 )
        {
            AnswerVal="Enter valid Numbers for Division"
        }
        else if(num1===num2)
        {
            AnswerVal=1;
        }
        else Answer=num1/num2;
    }

    finalAnswer.textContent ="Result : "+  AnswerVal;

}