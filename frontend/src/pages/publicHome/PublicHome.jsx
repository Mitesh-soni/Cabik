import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './PublicHome.css';

const PublicHome = () => {
  const [activeTab, setActiveTab] = useState('cars');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const vehicles = {
    cars: [
      {
        id: 1,
        name: 'Electric Sedan Pro',
        image: 'https://images.unsplash.com/photo-1619405399517-d4dc2ebb6e65?w=400&h=300&fit=crop',
        price: '₹45,00,000',
        rating: 4.8,
        reviews: 324
      },
      {
        id: 2,
        name: 'Premium SUV X',
        image: 'https://images.unsplash.com/photo-1606661160365-ec2df60dd992?w=400&h=300&fit=crop',
        price: '₹55,00,000',
        rating: 4.9,
        reviews: 512
      },
      {
        id: 3,
        name: 'Compact City Car',
        image: 'https://images.unsplash.com/photo-1609708536965-bc4a60a54612?w=400&h=300&fit=crop',
        price: '₹25,00,000',
        rating: 4.7,
        reviews: 289
      },
      {
        id: 4,
        name: 'Luxury Sedan Elite',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop',
        price: '₹65,00,000',
        rating: 4.9,
        reviews: 445
      }
    ],
    bikes: [
      {
        id: 1,
        name: 'Sport Bike Thunder',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        price: '₹2,50,000',
        rating: 4.8,
        reviews: 156
      },
      {
        id: 2,
        name: 'Cruiser King',
        image: 'https://images.unsplash.com/photo-1558618667-0e6d0c09a5de?w=400&h=300&fit=crop',
        price: '₹1,80,000',
        rating: 4.6,
        reviews: 203
      },
      {
        id: 3,
        name: 'Adventure Master',
        image: 'https://images.unsplash.com/photo-1558618668-169f5e8dcb14?w=400&h=300&fit=crop',
        price: '₹2,20,000',
        rating: 4.7,
        reviews: 178
      },
      {
        id: 4,
        name: 'Electric Beast',
        image: 'https://images.unsplash.com/photo-1558618668-169f5e8dcb14?w=400&h=300&fit=crop',
        price: '₹3,00,000',
        rating: 4.9,
        reviews: 267
      }
    ],
    scooties: [
      {
        id: 1,
        name: 'Eco Ride 3000',
        image: 'https://images.unsplash.com/photo-1606661160365-ec2df60dd992?w=400&h=300&fit=crop',
        price: '₹1,20,000',
        rating: 4.7,
        reviews: 412
      },
      {
        id: 2,
        name: 'Smart Scooter X',
        image: 'https://images.unsplash.com/photo-1609708536965-bc4a60a54612?w=400&h=300&fit=crop',
        price: '₹95,000',
        rating: 4.6,
        reviews: 298
      },
      {
        id: 3,
        name: 'Urban Zoom',
        image: 'https://images.unsplash.com/photo-1619405399517-d4dc2ebb6e65?w=400&h=300&fit=crop',
        price: '₹1,40,000',
        rating: 4.8,
        reviews: 534
      },
      {
        id: 4,
        name: 'Premium Comfort',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop',
        price: '₹1,60,000',
        rating: 4.9,
        reviews: 389
      }
    ]
  };

  const upcomingLaunches = [
    {
      id: 1,
      name: 'Electric Revolution 2025',
      category: 'cars',
      launchDate: 'Q1 2025',
      image: 'https://images.unsplash.com/photo-1619405399517-d4dc2ebb6e65?w=400&h=300&fit=crop',
      description: 'Next-gen electric sedan with 600km range'
    },
    {
      id: 2,
      name: 'Hybrid Adventure Pro',
      category: 'bikes',
      launchDate: 'Q2 2025',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      description: 'Hybrid motorcycle for adventure seekers'
    },
    {
      id: 3,
      name: 'AI Smart Scooter',
      category: 'scooties',
      launchDate: 'Q1 2025',
      image: 'https://images.unsplash.com/photo-1606661160365-ec2df60dd992?w=400&h=300&fit=crop',
      description: 'AI-powered scooter with voice control'
    }
  ];

  const reasons = [
    {
      id: 1,
      title: 'Best Prices',
      description: 'Competitive pricing with exclusive deals and discounts',
      icon: '💰',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Wide Selection',
      description: 'Choose from hundreds of vehicles across all categories',
      icon: '🚗',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Easy Financing',
      description: 'Flexible EMI options with zero interest schemes',
      icon: '📊',
      color: 'pink'
    },
    {
      id: 4,
      title: 'Expert Support',
      description: 'Professional team to help with every decision',
      icon: '🤝',
      color: 'green'
    },
    {
      id: 5,
      title: 'Fast Delivery',
      description: 'Quick delivery within 7 days of purchase',
      icon: '⚡',
      color: 'orange'
    },
    {
      id: 6,
      title: 'Quality Guarantee',
      description: '3-year warranty on all vehicles',
      icon: '✅',
      color: 'cyan'
    }
  ];

  const features = [
    {
      title: 'Smart Financing',
      description: 'Flexible payment plans tailored to your budget'
    },
    {
      title: 'Premium Insurance',
      description: 'Comprehensive coverage options included'
    },
    {
      title: 'Expert Guidance',
      description: 'Our specialists help you find the perfect vehicle'
    },
    {
      title: 'After-Sale Support',
      description: '24/7 customer service and maintenance support'
    }
  ];

  const trustIndicators = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '500+', label: 'Vehicles Available' },
    { number: '4.8★', label: 'Average Rating' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <>
      <Navbar />
      <div className="public-home">
        {/* Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        {/* Hero Banner */}
        <section className="hero-banner" style={{ transform: `translateY(${scrollPosition * 0.5}px)` }}>
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Drive Your Dreams</span>
              <br />
              <span className="gradient-text-2">Today</span>
            </h1>
            <p className="hero-subtitle">Discover the perfect vehicle with unbeatable prices, easy financing, and expert support</p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Shop Now
              </Link>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image" style={{ transform: `translateY(${scrollPosition * 0.3}px)` }}>
            <img src="https://images.unsplash.com/photo-1619405399517-d4dc2ebb6e65?w=600&h=500&fit=crop" alt="Featured Vehicle" />
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="trust-indicators">
          <div className="trust-container">
            {trustIndicators.map((indicator) => (
              <div key={indicator.label} className="trust-card">
                <div className="trust-number">{indicator.number}</div>
                <div className="trust-label">{indicator.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Now Section */}
        <section className="trending-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">Trending Now</span>
            </h2>
            <p className="section-subtitle">Explore our most popular vehicles</p>
          </div>

          {/* Tab Navigation */}
          <div className="tabs-container">
            <div className="tabs">
              {['cars', 'bikes', 'scooties'].map((tab) => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="vehicles-grid">
            {vehicles[activeTab].map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-image-container">
                  <img src={vehicle.image} alt={vehicle.name} className="vehicle-image" />
                  <div className="vehicle-badge">Popular</div>
                </div>
                <div className="vehicle-content">
                  <h3 className="vehicle-name">{vehicle.name}</h3>
                  <div className="vehicle-rating">
                    <span className="stars">{'⭐'.repeat(Math.round(vehicle.rating))}</span>
                    <span className="rating-text">{vehicle.rating} ({vehicle.reviews})</span>
                  </div>
                  <div className="vehicle-price">{vehicle.price}</div>
                  <Link to="/login" className="vehicle-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Launches */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">Coming Soon</span>
            </h2>
            <p className="section-subtitle">Exciting launches just around the corner</p>
          </div>

          <div className="upcoming-grid">
            {upcomingLaunches.map((launch) => (
              <div key={launch.id} className="upcoming-card">
                <div className="upcoming-image">
                  <img src={launch.image} alt={launch.name} />
                  <div className="launch-date-badge">{launch.launchDate}</div>
                </div>
                <div className="upcoming-content">
                  <h3 className="upcoming-name">{launch.name}</h3>
                  <p className="upcoming-description">{launch.description}</p>
                  <button className="notify-btn">Notify Me</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-choose-us">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">Why Choose Us</span>
            </h2>
            <p className="section-subtitle">Industry-leading advantages that set us apart</p>
          </div>

          <div className="reasons-grid">
            {reasons.map((reason) => (
              <div key={reason.id} className={`reason-card reason-${reason.color}`}>
                <div className="reason-icon">{reason.icon}</div>
                <h3 className="reason-title">{reason.title}</h3>
                <p className="reason-description">{reason.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <div className="features-header">
              <h2 className="section-title">
                <span className="gradient-text">Our Features</span>
              </h2>
              <p className="section-subtitle">Everything you need for a seamless buying experience</p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-number">{index + 1}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Drive Your Dream Vehicle?</h2>
            <p className="cta-subtitle">Join thousands of satisfied customers who found their perfect match</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                Start Shopping Now
              </Link>
              <button className="btn btn-secondary btn-large">Contact Sales</button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default PublicHome;
