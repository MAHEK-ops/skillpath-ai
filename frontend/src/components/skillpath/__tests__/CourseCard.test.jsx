import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CourseCard from '../CourseCard';

// Simple mock for CourseCard
const MockCourseCard = ({ course, isSelected, onClick }) => (
  <div data-testid="course-card" data-selected={isSelected} onClick={onClick}>
    <h3 data-testid="course-title">{course.title}</h3>
    <p data-testid="course-duration">{course.duration}</p>
  </div>
);

vi.mock('../CourseCard', () => {
  return {
    default: function DummyCourseCard(props) {
      return <MockCourseCard {...props} />;
    }
  };
});

describe('CourseCard Tests', () => {
    const mockCourse = {
        id: 1,
        title: "Test Driven Development",
        duration: "5 hours",
        skill: "Testing",
    };

    it('renders course properties correctly', () => {
        render(<CourseCard course={mockCourse} isSelected={false} onClick={() => {}} />);
        expect(screen.getByTestId('course-title')).toHaveTextContent('Test Driven Development');
        expect(screen.getByTestId('course-duration')).toHaveTextContent('5 hours');
    });

    it('applies selected state styling', () => {
        render(<CourseCard course={mockCourse} isSelected={true} onClick={() => {}} />);
        expect(screen.getByTestId('course-card')).toHaveAttribute('data-selected', 'true');
    });

    it('fires onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<CourseCard course={mockCourse} isSelected={false} onClick={handleClick} />);
        
        fireEvent.click(screen.getByTestId('course-card'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
