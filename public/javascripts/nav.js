(function onMobile(){
          if(window.innerWidth < 600){
            document.querySelector(".catg").innerHTML=`<a href="/NewArrivals"><div class="sec">New Arrivals</div> </a>
                <a href="/store"><div class="sec">Store</div> </a>
                <a href="/tshirt"><div class="sec">T-Shirts</div></a>
                <a href=""><div class="sec">Bottoms</div></a>
                <a href=""><div class="sec">Sweatshirt</div> </a>
                <a href=""><div class="sec">Hoodies</div> </a>
                <a href=""><div class="sec">Customisation</div> </a>
                <a href=""><div class="sec">Blog</div> </a>
                <a href=""><div class="sec">Why to Oversize?</div> </a>
                <a href=""><div class="sec">Help & Support</div> </a>
                <a href=""><div class="sec">Suggestions</div></a>
                <a href=""><div class="sec">About Us</div></a>
                <a href="/logout"><div class="sec">Log Out</div></a>
                `
          }
          else{
            document.querySelector(".catg").innerHTML=`
                <a href=""><div class="sec">New Arrivals</div> </a>
                <a href=""><div class="sec">T-Shirts</div></a>
                <a href=""><div class="sec">Bottoms</div></a>
                <a href=""><div class="sec">Sweatshirt</div> </a>
                <a href=""><div class="sec">Hoodies</div> </a>
                <a href=""><div class="sec">Customisation</div> </a>
                <a href=""><div class="sec">Suggestions</div></a>
                <a href=""><div class="sec">About Us</div></a>
                <a href="/logout"><div class="sec">Log Out</div></a>
                `
          }
        })();
        var sbar =  0
        function sidebaropen() {
          console.log("click");
          if(sbar === 0 ) {
            
            let tl = gsap.timeline();
            tl.to(
              ".sidebarmain",
            {
              display: "flex",
            },
            "a"
            ).to(
            ".sidebar",
            {
              duration: 0.2,
              ease: Linear.easeInOut,
              x: 0,
            },
            "a"
            );
            console.log("chala");
  
          let tl2 = gsap.timeline();
          tl2
          .to(".hamburgerlines .line2",{
            width:'0%',
            duration:0.2,
            ease:Linear.easeInOut
          })
          .to(".hamburgerlines .line1",{
            rotate:'45deg',
            duration:0.2,
  
            ease:Linear.easeInOut
  
          },"a")
          .to(".hamburgerlines .line3",{
            rotate:'-45deg',
            duration:0.2,
  
            ease:Linear.easeInOut
  
          },"a")
          sbar = 1;
        }
       
        else{
          sidebarclose()
  
  
          sbar = 0;
  
        }
        }
        function sidebarclose() {
    
          if( window.innerWidth < 600){
            document.querySelector(".sidebar").setAttribute("class", "sidebar leftbar");
  
            let tl = gsap.timeline();
          tl.to(".sidebar", {
            duration: 0.09,
            ease: Linear.easeInOut,
            x: "-100%",
          }).to(".sidebarmain", {
            duration: 0.01,
            display: "none",
          });
  
          document.querySelector(".sidebar").setAttribute("class", "sidebar");
          }
          else{
            document.querySelector(".sidebar").setAttribute("class", "sidebar");
  
            let tl = gsap.timeline();
          tl.to(".sidebar", {
            duration: 0.09,
            ease: Linear.easeInOut,
            x: "100%",
          }).to(".sidebarmain", {
            duration: 0.01,
            display: "none",
          });
          document.querySelector(".sidebar").setAttribute("class", "sidebar leftbar");
  
          }
          let tl2 = gsap.timeline();
          tl2
          .to(".hamburgerlines .line1",{
            rotate:'0deg',
            duration:0.2,
            ease:Linear.easeInOut
  
          },"a")
          .to(".hamburgerlines .line3",{
            rotate:'0deg',
            duration:0.2,
            ease:Linear.easeInOut
  
          },"a")
          .to(".hamburgerlines .line2",{
            width:'100%',
            duration:0.2,
  
            ease:Linear.easeInOut
  
          })
          sbar = 0;
  
        }
   