$(function () {

    //Fancybox 
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }

    //confirmClearcart
    $('a.confirmClearcart').on('click', function() {
        if(!confirm('Confirm clear cart'))
            return false;
    });
})