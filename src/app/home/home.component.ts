import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('animateElement') animateElements!: QueryList<ElementRef>;

  // Statistiques animées
  stats = [
    { value: 500, suffix: '+', label: 'Établissements', current: 0 },
    { value: 50000, suffix: '+', label: 'Utilisateurs actifs', current: 0 },
    { value: 99.9, suffix: '%', label: 'Disponibilité', current: 0 }
  ];

  private observer!: IntersectionObserver;
  private animationFrame!: number;
  private statsAnimated = false;

  constructor(
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.initializeScrollAnimations();
    this.initializeParallaxEffects();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  // Animation des statistiques
  private animateStats(): void {
    if (this.statsAnimated) return;

    this.statsAnimated = true;
    this.stats.forEach((stat, index) => {
      this.animateNumber(stat, index);
    });
  }

  private animateNumber(stat: any, index: number): void {
    const duration = 2000; // 2 secondes
    const start = Date.now();
    const startValue = 0;
    const endValue = stat.value;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      stat.current = currentValue;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    // Délai pour chaque statistique
    setTimeout(() => {
      animate();
    }, index * 200);
  }

  // Configuration des animations au scroll
  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '-50px 0px -50px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;

          // Animation basée sur les classes de données
          if (element.classList.contains('animate-on-scroll')) {
            element.classList.add('animate');
          }

          if (element.classList.contains('animate-slide-left')) {
            element.classList.add('animate');
          }

          if (element.classList.contains('animate-slide-right')) {
            element.classList.add('animate');
          }

          if (element.classList.contains('animate-scale-in')) {
            element.classList.add('animate');
          }

          // Animation spéciale pour les statistiques
          if (element.classList.contains('stats-section')) {
            this.animateStats();
          }

          // Animation des cartes features
          if (element.classList.contains('feature-card')) {
            element.classList.add('animate');
          }
        }
      });
    }, options);

    // Observer tous les éléments avec des classes d'animation
    const animatedElements = this.elementRef.nativeElement.querySelectorAll(
      '.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale-in, .stats-section, .feature-card'
    );

    animatedElements.forEach((element: Element) => {
      this.observer.observe(element);
    });
  }

  // Effets de parallaxe
  private initializeParallaxEffects(): void {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const parallaxElements = document.querySelectorAll('.parallax-element');

          parallaxElements.forEach((element: any) => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
          });

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Animations au scroll générales
  private initializeScrollAnimations(): void {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;

      // Animation du header (réduction au scroll)
      const header = document.querySelector('header');
      if (header) {
        if (scrollTop > 100) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }

      // Animation des éléments avec effet de révélation progressive
      const revealElements = document.querySelectorAll('.reveal-on-scroll');
      revealElements.forEach((element: any) => {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const windowHeight = window.innerHeight;

        if (scrollTop > elementTop - windowHeight + elementHeight / 4) {
          element.classList.add('revealed');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Gestionnaire d'événements pour les interactions
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Recalculer les positions pour les animations au resize
    this.setupIntersectionObserver();
  }

  // Méthode pour les interactions des cartes
  onCardHover(card: HTMLElement): void {
    card.classList.add('micro-bounce');
    setTimeout(() => {
      card.classList.remove('micro-bounce');
    }, 400);
  }

  // Méthode pour les clics sur les icônes de navigation
  onNavIconClick(icon: HTMLElement): void {
    icon.classList.add('micro-glow');
    setTimeout(() => {
      icon.classList.remove('micro-glow');
    }, 800);
  }

  // Smooth scroll vers les sections
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}