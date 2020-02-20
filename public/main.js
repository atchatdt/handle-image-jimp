const allImg = document.querySelectorAll('.img')

allImg.forEach(item => {
    
    item.addEventListener('click',function(value){
        let nameImg = value.path[1].innerText
        document.getElementById('name-img').value = nameImg
        document.getElementById('name-img-edit').value = nameImg
    })

})