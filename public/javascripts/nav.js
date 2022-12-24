(function onMobile(){
          if(window.innerWidth < 600){
            document.querySelector(".catg").innerHTML=`<a href="/newArrival"><div class="sec">New Arrivals</div> </a>
                <a href="/store"><div class="sec">Store</div> </a>
                <a href="/oversized"><div class="sec"> Oversized T-Shirts</div></a>
                <a href="/thrifted"><div class="sec">Thrifted</div> </a>
                <a href="/sweatshirt"><div class="sec">Sweatshirt</div> </a>
                <a href="/Hoodies"><div class="sec">Hoodies</div> </a>
                <a href="/custom"><div class="sec">Customisation</div> </a>
                <a href="/myorders"><div class="sec">My Orders</div> </a>
                <a href="/about"><div class="sec">About Us</div></a>
                `
          }
          else{
            document.querySelector(".catg").innerHTML=`
                <a href="/newArrival"><div class="sec">New Arrivals</div> </a>
                <a href="/oversized"><div class="sec">Oversized T-Shirts</div></a>
                <a href="/thrifted"><div class="sec">Thrifted</div></a>
                <a href="/LimitedEdition"><div class="sec">Limited Edition</div></a>
                <a href="/sweatshirt"><div class="sec">Sweatshirt</div> </a>
                <a href="/hoodies"><div class="sec">Hoodies</div> </a>
                <a href="/custom"><div class="sec">Customisation</div> </a>
                <a href="/myorders"><div class="sec">My Orders</div> </a>
                <a href="/about"><div class="sec">About Us</div></a>
                
                `
          }
        })();
        var sbar =  0
        function sidebaropen() {
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
   