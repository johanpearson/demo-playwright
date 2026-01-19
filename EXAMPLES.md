# Multi-User Testing Examples

This document provides detailed examples of common multi-user testing scenarios.

## Example 1: User Collaboration

Test scenario where User X creates content and User Y reviews it.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('User X creates document, User Y reviews it', async ({ pageUserX, pageUserY }) => {
  // User X creates a document
  const editorPageX = new EditorPage(pageUserX);
  await editorPageX.navigate();
  await editorPageX.createDocument('Test Document');
  await editorPageX.addContent('This is test content');
  const documentId = await editorPageX.saveDocument();
  
  // User Y navigates to the document to review
  const editorPageY = new EditorPage(pageUserY);
  await editorPageY.navigateToDocument(documentId);
  
  // User Y can see the document created by User X
  const content = await editorPageY.getContent();
  expect(content).toContain('This is test content');
  
  // User Y adds a comment
  await editorPageY.addComment('Looks good!');
});
```

## Example 2: Permission Testing

Test different user roles with different permissions.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('Admin can delete, regular user cannot', async ({ pageUserX, pageUserY }) => {
  // Assuming userX is regular user and userY is admin
  
  // Regular user tries to access delete button
  const dashboardUserX = new DashboardPage(pageUserX);
  await dashboardUserX.navigate();
  const canDelete = await dashboardUserX.isDeleteButtonVisible();
  expect(canDelete).toBeFalsy(); // Regular user should not see delete button
  
  // Admin user can see and use delete button
  const dashboardUserY = new DashboardPage(pageUserY);
  await dashboardUserY.navigate();
  const adminCanDelete = await dashboardUserY.isDeleteButtonVisible();
  expect(adminCanDelete).toBeTruthy(); // Admin should see delete button
});
```

## Example 3: Real-Time Updates

Test real-time updates where changes by one user are reflected for another.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('User Y sees updates made by User X in real-time', async ({ pageUserX, pageUserY }) => {
  const chatPageX = new ChatPage(pageUserX);
  const chatPageY = new ChatPage(pageUserY);
  
  // Both users open the same chat room
  await chatPageX.joinRoom('room-123');
  await chatPageY.joinRoom('room-123');
  
  // User X sends a message
  await chatPageX.sendMessage('Hello from User X!');
  
  // User Y should see the message (wait for real-time update)
  await chatPageY.waitForMessage('Hello from User X!');
  const messages = await chatPageY.getMessages();
  expect(messages).toContain('Hello from User X!');
  
  // User Y responds
  await chatPageY.sendMessage('Hi User X!');
  
  // User X sees the response
  await chatPageX.waitForMessage('Hi User X!');
});
```

## Example 4: Concurrent Editing

Test concurrent editing scenarios (e.g., Google Docs-like functionality).

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('Both users can edit document simultaneously', async ({ pageUserX, pageUserY }) => {
  const editorX = new EditorPage(pageUserX);
  const editorY = new EditorPage(pageUserY);
  
  // Both users open the same document
  await editorX.navigateToDocument('doc-123');
  await editorY.navigateToDocument('doc-123');
  
  // User X edits paragraph 1
  await editorX.editParagraph(1, 'User X content');
  
  // User Y edits paragraph 2 at the same time
  await editorY.editParagraph(2, 'User Y content');
  
  // Both users should see both changes
  await editorX.waitForSync();
  await editorY.waitForSync();
  
  const contentX = await editorX.getParagraph(2);
  const contentY = await editorY.getParagraph(1);
  
  expect(contentX).toBe('User Y content');
  expect(contentY).toBe('User X content');
});
```

## Example 5: Shopping Cart - Multiple Users

Test e-commerce scenarios with multiple shoppers.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('Multiple users can shop independently', async ({ pageUserX, pageUserY }) => {
  const shopX = new ShopPage(pageUserX);
  const shopY = new ShopPage(pageUserY);
  
  // User X adds items to cart
  await shopX.navigate();
  await shopX.addToCart('Product A');
  await shopX.addToCart('Product B');
  
  // User Y adds different items
  await shopY.navigate();
  await shopY.addToCart('Product C');
  
  // Verify carts are independent
  const cartX = await shopX.getCartItems();
  const cartY = await shopY.getCartItems();
  
  expect(cartX).toHaveLength(2);
  expect(cartY).toHaveLength(1);
  expect(cartX).toContain('Product A');
  expect(cartX).toContain('Product B');
  expect(cartY).toContain('Product C');
});
```

## Example 6: Multi-Tab Workflow

User working across multiple tabs simultaneously.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('User manages multiple tasks in different tabs', async ({ contextUserX }) => {
  // Open multiple tabs for User X
  const emailTab = await contextUserX.newPage();
  const dashboardTab = await contextUserX.newPage();
  const settingsTab = await contextUserX.newPage();
  
  const emailPage = new EmailPage(emailTab);
  const dashboardPage = new DashboardPage(dashboardTab);
  const settingsPage = new SettingsPage(settingsTab);
  
  // Work in different tabs in parallel
  await Promise.all([
    emailPage.navigate(),
    dashboardPage.navigate(),
    settingsPage.navigate(),
  ]);
  
  // User performs actions in different tabs
  await emailPage.sendEmail('test@example.com', 'Subject', 'Body');
  await settingsPage.updateProfile({ name: 'New Name' });
  await dashboardPage.checkNotifications();
  
  // Verify all tabs are still authenticated
  expect(await emailPage.isLoggedIn()).toBeTruthy();
  expect(await dashboardPage.isLoggedIn()).toBeTruthy();
  expect(await settingsPage.isLoggedIn()).toBeTruthy();
  
  // Clean up
  await emailTab.close();
  await dashboardTab.close();
  await settingsTab.close();
});
```

## Example 7: Session Handoff

Test scenario where one user starts a task and another completes it.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('User X starts ticket, User Y resolves it', async ({ pageUserX, pageUserY }) => {
  // User X (customer) creates a support ticket
  const ticketPageX = new TicketPage(pageUserX);
  await ticketPageX.navigate();
  await ticketPageX.createTicket({
    title: 'Need help',
    description: 'I have an issue',
  });
  const ticketId = await ticketPageX.getLatestTicketId();
  
  // User Y (support agent) responds to the ticket
  const ticketPageY = new TicketPage(pageUserY);
  await ticketPageY.navigateToTicket(ticketId);
  await ticketPageY.addResponse('I can help you with this');
  await ticketPageY.resolveTicket();
  
  // User X sees the resolution
  await ticketPageX.refresh();
  const status = await ticketPageX.getTicketStatus(ticketId);
  expect(status).toBe('Resolved');
  
  const response = await ticketPageX.getTicketResponse(ticketId);
  expect(response).toContain('I can help you with this');
});
```

## Example 8: Privacy Testing

Verify users can only see their own data.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('Users can only access their own documents', async ({ pageUserX, pageUserY }) => {
  // User X creates a private document
  const docsPageX = new DocumentsPage(pageUserX);
  await docsPageX.navigate();
  await docsPageX.createDocument({
    title: 'User X Private Doc',
    visibility: 'private',
  });
  
  // User Y tries to access User X's documents
  const docsPageY = new DocumentsPage(pageUserY);
  await docsPageY.navigate();
  const visibleDocs = await docsPageY.getDocumentList();
  
  // User Y should not see User X's private document
  expect(visibleDocs).not.toContain('User X Private Doc');
  
  // User Y creates their own document
  await docsPageY.createDocument({
    title: 'User Y Private Doc',
    visibility: 'private',
  });
  
  // User X should not see User Y's document
  await docsPageX.refresh();
  const docsForUserX = await docsPageX.getDocumentList();
  expect(docsForUserX).not.toContain('User Y Private Doc');
});
```

## Example 9: Notification Testing

Test notifications between users.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('User X receives notification from User Y action', async ({ pageUserX, pageUserY }) => {
  const dashX = new DashboardPage(pageUserX);
  const dashY = new DashboardPage(pageUserY);
  
  // Both users on dashboard
  await dashX.navigate();
  await dashY.navigate();
  
  // User Y mentions User X in a comment
  await dashY.createComment('@UserX please review this');
  
  // User X should receive a notification
  await dashX.waitForNotification();
  const notifications = await dashX.getNotifications();
  expect(notifications).toContain('UserY mentioned you');
});
```

## Example 10: Workflow State Testing

Test complex workflows that require multiple users.

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';

test('Document approval workflow', async ({ pageUserX, pageUserY }) => {
  // User X (author) submits document for approval
  const docPageX = new DocumentPage(pageUserX);
  await docPageX.navigate();
  await docPageX.createDocument('Quarterly Report');
  await docPageX.submitForApproval();
  const docId = await docPageX.getDocumentId();
  
  // Verify document is in pending state
  const statusX = await docPageX.getStatus();
  expect(statusX).toBe('Pending Approval');
  
  // User Y (approver) reviews and approves
  const docPageY = new DocumentPage(pageUserY);
  await docPageY.navigateToDocument(docId);
  await docPageY.review();
  await docPageY.approve();
  
  // User X sees the approved status
  await docPageX.refresh();
  const finalStatus = await docPageX.getStatus();
  expect(finalStatus).toBe('Approved');
  
  // User X can now publish the document
  const canPublish = await docPageX.canPublish();
  expect(canPublish).toBeTruthy();
});
```

## Tips for Multi-User Tests

1. **Use descriptive variable names**: `pageUserX`, `pageUserY` instead of `page1`, `page2`
2. **Add comments**: Explain which user is doing what
3. **Test isolation**: Ensure actions by one user don't unexpectedly affect another
4. **Wait for updates**: Use appropriate waits for real-time features
5. **Clean up**: Close tabs and contexts when done
6. **Verify independence**: Check that users' data/sessions are truly separate
7. **Test edge cases**: What happens when both users do the same thing simultaneously?

## Common Assertions for Multi-User Tests

```typescript
// Verify users are independent
expect(await pageX.getSessionId()).not.toBe(await pageY.getSessionId());

// Verify proper isolation
expect(await pageX.getCartItems()).not.toEqual(await pageY.getCartItems());

// Verify shared state updates
await pageX.updateSharedDocument('content');
await pageY.refresh();
expect(await pageY.getDocumentContent()).toBe('content');

// Verify permissions
expect(await pageX.canDelete()).toBeFalsy();
expect(await pageY.canDelete()).toBeTruthy();

// Verify notifications
await pageY.performAction();
await pageX.waitForNotification();
expect(await pageX.hasNotification()).toBeTruthy();
```

## Debugging Multi-User Tests

```typescript
// Take screenshots of both users' views
test('Debug multi-user issue', async ({ pageUserX, pageUserY }) => {
  await pageUserX.screenshot({ path: 'debug-userX.png' });
  await pageUserY.screenshot({ path: 'debug-userY.png' });
  
  // Check console logs for both users
  pageUserX.on('console', msg => console.log('UserX:', msg.text()));
  pageUserY.on('console', msg => console.log('UserY:', msg.text()));
  
  // Your test code...
});
```

Happy multi-user testing! 🎭
