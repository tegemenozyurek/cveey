import { Component } from 'react'

export default class CvPreviewErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, resetKey: props.resetKey }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, resetKey: props.resetKey }
    }
    return null
  }

  render() {
    if (this.state.hasError) {
      return (
        <aside className="create-cv-preview-wrap">
          <div className="create-cv-preview-fallback" role="alert">
            <strong>{this.props.title}</strong>
            <p>{this.props.message}</p>
          </div>
        </aside>
      )
    }

    return this.props.children
  }
}
