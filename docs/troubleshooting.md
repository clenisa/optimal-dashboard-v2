# Troubleshooting Guide

## Common Issues and Solutions

### 🔐 Authentication Issues

#### Problem: Can't log in
**Symptoms**: Login button doesn't work, no error message
**Solutions**:
1. Check your internet connection
2. Verify Supabase credentials in environment variables
3. Clear browser cache and cookies
4. Check browser console for error messages

#### Problem: User session expires unexpectedly
**Symptoms**: Logged out without warning, need to re-authenticate
**Solutions**:
1. Check Supabase session timeout settings
2. Verify JWT token expiration
3. Implement session refresh logic

### 📊 CSV Upload Issues

#### Problem: File upload fails
**Symptoms**: File selection doesn't work, upload button disabled
**Solutions**:
1. Ensure file is in CSV format (.csv extension)
2. Check file size (max 10MB)
3. Verify file has required columns: Date, Amount, Description, Category
4. Check browser console for validation errors

#### Problem: Validation errors
**Symptoms**: File uploads but shows validation errors
**Solutions**:
1. Check CSV column headers match exactly
2. Ensure date format is YYYY-MM-DD or MM/DD/YYYY
3. Verify amounts are numeric (no currency symbols)
4. Check for empty required fields

#### Problem: Database import fails
**Symptoms**: Validation passes but data doesn't appear in charts
**Solutions**:
1. Check Supabase connection
2. Verify user authentication
3. Check database permissions (RLS policies)
4. Review database logs for errors

### 📈 Chart Display Issues

#### Problem: Charts don't load
**Symptoms**: Empty chart area, loading spinner stuck
**Solutions**:
1. Check if data exists in database
2. Verify Chart.js library loaded correctly
3. Check browser console for JavaScript errors
4. Ensure component has proper dimensions

#### Problem: Charts show incorrect data
**Symptoms**: Wrong values, missing categories
**Solutions**:
1. Verify data source and filtering
2. Check data transformation logic
3. Ensure proper data types (numbers vs strings)
4. Review chart configuration options

### 🤖 AI Chat Issues

#### Problem: AI console not connected
**Symptoms**: "Disconnected" status, can't send messages
**Solutions**:
1. Ensure ElectronConsole is running on your PC
2. Check console URL (default: http://localhost:3000)
3. Verify firewall settings allow local connections
4. Check ElectronConsole logs for errors

#### Problem: No AI response
**Symptoms**: Message sent but no reply received
**Solutions**:
1. Check ElectronConsole is processing requests
2. Verify Ollama models are loaded
3. Check credit balance (requires credits to chat)
4. Review network requests in browser dev tools

#### Problem: Credits not working
**Symptoms**: Can't send messages due to credit issues
**Solutions**:
1. Check daily credit allocation (5 free per day)
2. Verify credit balance in database
3. Check credit deduction logic
4. Ensure user authentication is valid

### 🎨 Theme Issues

#### Problem: Theme doesn't change
**Symptoms**: Theme toggle doesn't work, stuck in one mode
**Solutions**:
1. Check browser localStorage permissions
2. Verify theme provider is properly configured
3. Check CSS variables are being applied
4. Clear browser cache and reload

#### Problem: Theme inconsistent across components
**Symptoms**: Some components use different themes
**Solutions**:
1. Ensure all components use theme context
2. Check CSS variable inheritance
3. Verify component theme integration
4. Review theme provider setup

### 🖥️ Window Management Issues

#### Problem: Windows don't open
**Symptoms**: Clicking app icons doesn't open windows
**Solutions**:
1. Check window store initialization
2. Verify app definitions are loaded
3. Check browser console for errors
4. Ensure proper event handling

#### Problem: Windows can't be moved/resized
**Symptoms**: Windows stuck in place, resize handles don't work
**Solutions**:
1. Check mouse event handling
2. Verify window state management
3. Ensure proper CSS positioning
4. Check for conflicting event listeners

### 📱 Mobile/Responsive Issues

#### Problem: Layout breaks on mobile
**Symptoms**: Components overlap, text too small
**Solutions**:
1. Check responsive breakpoints
2. Verify mobile-specific CSS
3. Test touch interactions
4. Review component mobile adaptations

#### Problem: Touch interactions don't work
**Symptoms**: Can't tap buttons, scroll issues
**Solutions**:
1. Check touch event handling
2. Verify button sizes meet mobile standards
3. Test scroll area functionality
4. Ensure proper touch targets

## Debug Mode

### Enable Debug Logging
Set environment variable to enable detailed logging:
```bash
NEXT_PUBLIC_DEBUG=true
```

### Check Browser Console
1. Open browser developer tools (F12)
2. Check Console tab for error messages
3. Look for failed network requests
4. Review component render logs

### Database Debugging
1. Check Supabase dashboard logs
2. Verify RLS policies are working
3. Test queries directly in SQL editor
4. Check user permissions

## Performance Issues

### Slow Loading
**Symptoms**: Long initial load times, slow chart rendering
**Solutions**:
1. Implement lazy loading for components
2. Optimize database queries
3. Add loading states and skeletons
4. Use React.memo for expensive components

### Memory Leaks
**Symptoms**: Application becomes slower over time
**Solutions**:
1. Check for unmounted component subscriptions
2. Verify proper cleanup in useEffect
3. Monitor memory usage in dev tools
4. Implement proper event listener cleanup

## Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search existing issues in the repository
3. Try the solution in a different browser
4. Clear browser cache and cookies
5. Check if the issue occurs in incognito mode

### When Reporting Issues
Include the following information:
- **Browser**: Chrome, Firefox, Safari, Edge
- **Version**: Browser version number
- **OS**: Windows, macOS, Linux
- **Steps**: Exact steps to reproduce
- **Expected**: What should happen
- **Actual**: What actually happens
- **Console**: Any error messages from browser console
- **Screenshots**: Visual evidence of the issue

### Support Channels
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the docs folder for detailed guides
- **Community**: Join discussions in the repository
- **Email**: For security or private issues

## Prevention Tips

### Regular Maintenance
1. Keep dependencies updated
2. Monitor error logs
3. Test on different devices/browsers
4. Validate data integrity

### Best Practices
1. Use proper error boundaries
2. Implement comprehensive logging
3. Test user flows regularly
4. Monitor performance metrics
5. Keep documentation updated

---

**Remember**: Most issues can be resolved by checking the browser console, verifying environment variables, and ensuring all services are running properly.
